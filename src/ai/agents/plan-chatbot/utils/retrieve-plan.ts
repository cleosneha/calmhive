import vectorStore from "@/ai/config/vector-store";

/**
 * Retrieve plan from embedding document using vector similarity search
 * Returns the formatted plan text with all tasks and days off
 */
export async function retrievePlanFromEmbeddings(
  userId: string
): Promise<string | null> {
  try {
    const store = await vectorStore;

    // Search for plan using userId as query
    const results = await store.similaritySearch(
      `plan for user ${userId}`,
      1 // Get top 1 result
    );

    if (results.length === 0) {
      console.warn(`No plan embedding found for user ${userId}`);
      return null;
    }

    // Filter by userId to ensure we get the right plan
    const userPlan = results.find((doc) => doc.metadata?.userId === userId);

    if (!userPlan) {
      console.warn(`Plan embedding found but userId mismatch for ${userId}`);
      return null;
    }

    // Return the plan text from the result
    return userPlan.pageContent;
  } catch (error) {
    console.error("Error retrieving plan from embeddings:", error);
    return null;
  }
}
