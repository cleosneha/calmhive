import { z } from "zod";
import { tool } from "@langchain/core/tools";
import prisma from "@/lib/db";

/**
 * Tool: Fetch user's current plan from database
 */
export const fetchPlanTool = tool(
  async ({ userId }: { userId: string }) => {
    try {
      const plan = await prisma.plan.findFirst({
        where: { userId },
        include: {
          tasks: {
            orderBy: [{ day: "asc" }, { timeRange: "asc" }],
          },
        },
      });

      if (!plan) {
        return {
          success: false,
          error: "No plan found for this user",
        };
      }

      return {
        success: true,
        data: {
          planId: plan.id,
          daysOff: plan.daysOff,
          hoursSummary: plan.hoursSummary,
          tasks: plan.tasks.map(
            (t: {
              id: number;
              day: string;
              timeRange: string;
              activity: string;
              status: string;
              notes: string | null;
            }) => ({
              id: t.id,
              day: t.day,
              timeRange: t.timeRange,
              activity: t.activity,
              status: t.status,
              notes: t.notes,
            })
          ),
        },
      };
    } catch (error) {
      console.error("Error fetching plan:", error);
      return {
        success: false,
        error: "Failed to fetch plan from database",
      };
    }
  },
  {
    name: "fetch_plan",
    description:
      "Fetch the user's current weekly wellness plan including all tasks and days off",
    schema: z.object({
      userId: z.string().describe("User ID to fetch plan for"),
    }),
  }
);
