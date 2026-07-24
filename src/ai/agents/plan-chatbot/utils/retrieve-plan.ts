import vectorStore from "@/ai/config/vector-store";
import prisma from "@/lib/db";
import { formatPlanForEmbedding } from "@/actions/plan/process-embedding";

/**
 * Retrieve plan from embedding document using vector similarity search.
 * Falls back to direct DB query if vector store is unavailable or returns no results.
 * Returns the formatted plan text with all tasks and days off.
 */
export async function retrievePlanFromEmbeddings(
  userId: string,
): Promise<string | null> {
  // Try vector store first
  try {
    const store = await vectorStore;

    if (store) {
      const results = await store.similaritySearch(
        `plan for user ${userId}`,
        5,
      );

      if (results.length > 0) {
        const userPlan =
          results.find((doc) => doc.metadata?.userId === userId) ?? results[0];

        if (userPlan?.pageContent) {
          return userPlan.pageContent;
        }
      }
    }
  } catch (error) {
    console.error("Vector store retrieval failed, falling back to DB:", error);
  }

  // Fallback: build plan text directly from DB
  try {
    const plan = await prisma.plan.findFirst({
      where: { userId },
      include: { tasks: true },
    });

    if (!plan || plan.tasks.length === 0) {
      return null;
    }

    return await formatPlanForEmbedding(plan.tasks, plan.daysOff);
  } catch (error) {
    console.error("DB fallback retrieval failed:", error);
    return null;
  }
}
