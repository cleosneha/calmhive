import model from "@/ai/config/llm";
import type { EditAnalysisResult } from "../types";

/**
 * Analyze user message to determine intent (query vs edit)
 * Uses LLM to understand context and extract edit details
 */
export async function analyzeUserMessage(
  userMessage: string
): Promise<EditAnalysisResult> {
  const llm = model;

  const prompt = `You are an AI assistant analyzing user messages about their wellness plan.

Your task: Determine if the user wants to EDIT their plan or just ASK A QUESTION.

User message: "${userMessage}"

Analyze and respond in JSON:
{
  "isEditRequest": boolean,
  "isSafe": boolean,
  "isRelevant": boolean,
  "editType": "add_task" | "remove_task" | "modify_task" | "change_days_off" | "other" | null,
  "extractedEdit": {
    "day": string (Monday-Sunday),
    "timeRange": string (e.g., "6:00 AM - 7:00 AM"),
    "activity": string,
    "taskId": number | null,
    "daysOff": string[] | null
  } | null,
  "safetyIssue": string | null,
  "suggestion": string | null
}

Rules:
1. isEditRequest=true ONLY if user explicitly wants to add/remove/change tasks or days off
2. isSafe=false if message contains harmful, dangerous, or inappropriate wellness activities
3. isRelevant=false if message is completely unrelated to wellness/planning
4. Extract specific details (day, time, activity) for edits
5. For queries about the plan, set isEditRequest=false

Examples:
- "Add yoga on Monday at 6 AM" → isEditRequest=true, editType="add_task"
- "What tasks do I have tomorrow?" → isEditRequest=false
- "Remove the morning run" → isEditRequest=true, editType="remove_task"
- "Tell me a joke" → isRelevant=false`;

  try {
    const response = await llm.invoke(prompt);
    const content = response.content.toString();

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse LLM response");
    }

    const analysis: EditAnalysisResult = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error("Error analyzing message:", error);
    // Default to safe query if analysis fails
    return {
      isEditRequest: false,
      isSafe: true,
      isRelevant: true,
    };
  }
}
