"use server";

import { getCurrentUser } from "@/actions/auth";
import prisma from "@/lib/db";
import { compilePlanGraph } from "@/ai/agents/plan/graph";
import { handleAIError } from "@/utils/ai-error-handler";
import type { ApiResponse, ApiError } from "@/types/api";

/**
 * Server action: Generate a new plan using LangGraph agent
 */
export async function generatePlan(): Promise<
  ApiResponse<{ planId: number }> | ApiError
> {
  try {
    // 1. Get current user
    const user = await getCurrentUser();
    if (!user?.id) {
      return {
        status: "error",
        error: "Unauthorized",
        code: "UNAUTHORIZED",
      };
    }


    // 2. Check if plan already exists
    const existingPlan = await prisma.plan.findUnique({
      where: { userId: user.id },
    });

    if (existingPlan) {
      return {
        status: "success",
        data: { planId: existingPlan.id },
        message: "Plan already exists",
      };
    }

    // 3. Verify onboarding is complete
    const onboarding = await prisma.onboarding.findUnique({
      where: { userId: user.id },
    });

    if (!onboarding || !onboarding.termsAccepted) {
      return {
        status: "error",
        error: "Onboarding not completed",
        code: "PRECONDITION_FAILED",
      };
    }

    // 4. Compile and run the plan generation graph
    const graph = await compilePlanGraph();

    const result = await graph.invoke(
      {
        userId: user.id,
      },
      {
        configurable: {
          thread_id: `plan-${user.id}-${Date.now()}`,
        },
      }
    );

    // 5. Check for errors
    if (result.error) {
      // console.error("❌ Plan generation failed:", result.error);
      return {
        status: "error",
        error: result.error,
        code: "PLAN_GENERATION_FAILED",
      };
    }

    // 6. Validate result
    if (!result.generatedTasks || result.generatedTasks.length === 0) {
      return {
        status: "error",
        error: "No tasks generated",
        code: "PLAN_GENERATION_FAILED",
      };
    }

    if (!result.isComplete || !result.validation?.isValid) {
      return {
        status: "error",
        error: "Plan validation failed",
        code: "PLAN_GENERATION_FAILED",
      };
    }

    // 7. Store plan in database
    const plan = await prisma.plan.create({
      data: {
        userId: user.id,
        daysOff: onboarding.daysOff,
        hoursSummary: result.hoursSummary ?? undefined,
        tasks: {
          create: result.generatedTasks.map((task) => ({
            day: task.day,
            timeRange: task.timeRange,
            activity: task.activity,
            notes: task.notes || null,
            personalNotes: "",
          })),
        },
      },
      include: {
        tasks: true,
      },
    });

    // 8. Embed plan in vector store
    // Use the DB tasks (which now have IDs) instead of LLM tasks
    const { embedPlan } = await import("./process-embedding");
    const embedResult = await embedPlan(
      user.id,
      plan.id,
      plan.tasks,
      onboarding.daysOff
    );

    if (!embedResult.success) {
      // console.warn("⚠️ Failed to embed plan:", embedResult.error);
      // Don't fail the entire operation if embedding fails
    }

    // 9. Clean up checkpoints after successful generation
    try {
      const { Pool } = await import("pg");
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });

      await pool.query("DELETE FROM checkpoints WHERE thread_id LIKE $1", [
        `plan-${user.id}%`,
      ]);
      await pool.query("DELETE FROM checkpoint_blobs WHERE thread_id LIKE $1", [
        `plan-${user.id}%`,
      ]);
      await pool.query(
        "DELETE FROM checkpoint_writes WHERE thread_id LIKE $1",
        [`plan-${user.id}%`]
      );

      await pool.end();
    } catch (error) {
      console.warn("⚠️ Failed to clean up checkpoints:", error);
      // Don't fail the entire operation if cleanup fails
    }

    return {
      status: "success",
      data: { planId: plan.id },
      message: "Plan generated successfully",
    };
  } catch (error) {
    console.error("❌ Error generating plan:", error);
    const { error: errorMessage, code } = handleAIError(error);
    return {
      status: "error",
      error: errorMessage,
      code,
    };
  }
}
