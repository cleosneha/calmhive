import vectorStore from "@/ai/config/vector-store";

/**
 * Retrieve plan from embedding document using vector similarity search
 * Returns the formatted plan text with all tasks and days off
 */
export async function retrievePlanFromEmbeddings(
  userId: string,
): Promise<string | null> {
  try {
    const store = await vectorStore;

    // Search for plan using userId as query
    const results = await store.similaritySearch(
      `plan for user ${userId}`,
      5, // Get top 5 results to find the right one
    );

    if (results.length === 0) {
      console.warn(`No plan embedding found for user ${userId}`);
      return null;
    }

    // Filter by userId to ensure we get the right plan
    // First try exact match, then fall back to first result if no exact match
    let userPlan = results.find((doc) => doc.metadata?.userId === userId);

    if (!userPlan) {
      console.warn(
        `No exact userId match found for ${userId}, using first result`,
      );
      console.log(
        `Available metadata:`,
        results.map((r) => r.metadata),
      );
      // Use the first result if no exact match found (it should be the most relevant)
      userPlan = results[0];
    }

    // Return the plan text from the result
    return userPlan.pageContent;
  } catch (error) {
    console.error("Error retrieving plan from embeddings:", error);
    return null;
  }
}
