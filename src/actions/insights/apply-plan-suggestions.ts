"use server";

import { getCurrentUser } from "@/actions/auth";
import prisma from "@/lib/db";
import { compilePlanGraph } from "@/ai/agents/plan/graph";
import { handleAIError } from "@/utils/ai-error-handler";
import type { ApiResponse, ApiError } from "@/types/api";

/**
 * Server action: Apply AI plan suggestions by regenerating the plan
 * This uses the plan agent with suggestions as additional context
 */
export async function applyPlanSuggestions(
  planSuggestions: string,
): Promise<ApiResponse<{ planId: number }> | ApiError> {
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

    // 2. Get onboarding data (required for plan generation)
    const onboarding = await prisma.onboarding.findUnique({
      where: { userId: user.id },
    });

    if (!onboarding) {
      return {
        status: "error",
        error: "Onboarding data not found",
        code: "PRECONDITION_FAILED",
      };
    }

    // 3. Get current plan (we'll replace it)
    const currentPlan = await prisma.plan.findUnique({
      where: { userId: user.id },
      include: { tasks: true },
    });

    if (!currentPlan) {
      return {
        status: "error",
        error: "No existing plan to update",
        code: "NOT_FOUND",
      };
    }

    // 4. Delete current plan (cascades to tasks)
    await prisma.plan.delete({
      where: { id: currentPlan.id },
    });

    // 5. Compile and run the plan generation graph with suggestions
    const graph = await compilePlanGraph();

    const result = await graph.invoke(
      {
        userId: user.id,
        planSuggestions, // Pass suggestions as additional context
      },
      {
        configurable: {
          thread_id: `plan-suggestions-${user.id}-${Date.now()}`,
        },
      },
    );

    // 6. Check for errors
    if (result.error) {
      console.error("❌ Plan regeneration failed:", result.error);
      return {
        status: "error",
        error: result.error,
        code: "PLAN_GENERATION_FAILED",
      };
    }

    // 7. Validate result
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

    // 8. Create new plan in database
    const newPlan = await prisma.plan.create({
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

    // 9. Embed new plan in vector store
    const { embedPlan } = await import("../plan/process-embedding");
    const embedResult = await embedPlan(
      user.id,
      newPlan.id,
      newPlan.tasks,
      onboarding.daysOff,
    );

    if (!embedResult.success) {
      console.warn("⚠️ Failed to embed plan:", embedResult.error);
    }

    // 10. Clean up checkpoints
    try {
      const { Pool } = await import("pg");
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });

      await pool.query("DELETE FROM checkpoints WHERE thread_id LIKE $1", [
        `plan-suggestions-${user.id}%`,
      ]);
      await pool.query("DELETE FROM checkpoint_blobs WHERE thread_id LIKE $1", [
        `plan-suggestions-${user.id}%`,
      ]);
      await pool.query(
        "DELETE FROM checkpoint_writes WHERE thread_id LIKE $1",
        [`plan-suggestions-${user.id}%`],
      );

      await pool.end();
    } catch (error) {
      console.warn("⚠️ Failed to clean up checkpoints:", error);
    }

    return {
      status: "success",
      data: { planId: newPlan.id },
      message: "Plan updated successfully based on AI suggestions",
    };
  } catch (error) {
    console.error("❌ Error applying plan suggestions:", error);
    const { error: errorMessage } = handleAIError(error);
    return {
      status: "error",
      error: errorMessage,
      code: "INTERNAL_ERROR",
    };
  }
}
