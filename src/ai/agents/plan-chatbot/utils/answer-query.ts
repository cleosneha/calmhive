import model from "@/ai/config/llm";
import prisma from "@/lib/db";

/**
 * Answer user's query about their plan using RAG
 * (Retrieval from DB + LLM generation)
 */
export async function answerPlanQuery(
  userMessage: string,
  userId: string
): Promise<string> {
  try {
    // Fetch user's plan from database
    const plan = await prisma.plan.findFirst({
      where: { userId },
      include: {
        tasks: {
          orderBy: [{ day: "asc" }, { timeRange: "asc" }],
        },
      },
    });

    if (!plan) {
      return "You don't have a plan yet. Please create one first.";
    }

    // Format plan data for context
    const planContext = `
**User's Weekly Plan:**
- Days Off: ${plan.daysOff.join(", ") || "None"}
- Total Hours: ${
      plan.hoursSummary ? JSON.stringify(plan.hoursSummary) : "Not calculated"
    }

**Tasks:**
${plan.tasks
  .map(
    (t: {
      day: string;
      timeRange: string;
      activity: string;
      status: string;
      notes: string | null;
    }) =>
      `- ${t.day}, ${t.timeRange}: ${t.activity} (${t.status})${
        t.notes ? ` - Notes: ${t.notes}` : ""
      }`
  )
  .join("\n")}
`;

    // Use LLM to generate answer
    const llm = model;

    const prompt = `You are a helpful wellness plan assistant. Answer the user's question about their plan.

${planContext}

User Question: "${userMessage}"

Provide a clear, concise answer based on the plan data above. Use markdown formatting for better readability.
If the question asks about a specific day or task, include relevant details.
Be friendly and helpful.`;

    const response = await llm.invoke(prompt);
    return response.content.toString();
  } catch (error) {
    console.error("Error answering plan query:", error);
    return "I encountered an error while processing your question. Please try again.";
  }
}
