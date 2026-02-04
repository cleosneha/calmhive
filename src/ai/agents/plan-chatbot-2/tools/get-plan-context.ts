import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getPlanContext } from "../utils/plan-retrieval";

/**
 * Tool to get the current plan context
 * This should be called first to understand the user's current plan
 */
export const getPlanContextTool = tool(
  async ({ userId }: { userId: string }): Promise<string> => {
    const context = await getPlanContext(userId);

    if (!context) {
      return "User does not have a wellness plan yet. They need to create one first through the onboarding process.";
    }

    return context;
  },
  {
    name: "get_plan_context",
    description: `Get the user's current wellness plan. This tool MUST be called first before any plan modifications to understand what tasks and days exist.
    
Returns:
- A formatted view of all tasks grouped by day
- Days off information
- List of days with tasks

Always use this to verify:
- What days exist in the plan
- What tasks are on each day
- Current task times and activities
- Before attempting any modifications`,
    schema: z.object({
      userId: z.string().describe("The user's ID"),
    }),
  },
);
