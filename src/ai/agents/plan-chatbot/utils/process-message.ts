import type { EditAnalysisResult } from "../types";
import { invokeLLM } from "./llm-service";
import { retrievePlanFromEmbeddings } from "./retrieve-plan";

/**
 * Combined message processing - analyzes intent and answers query in single LLM call
 */
export async function processUserMessage(
  userMessage: string,
  userId: string
): Promise<{
  analysis: EditAnalysisResult;
  answer?: string;
}> {
  try {
    // Get plan context first
    const planContext = await retrievePlanFromEmbeddings(userId);

    const prompt = `Analyze user message about their wellness plan and provide response if needed.

${
  planContext ? `User's Plan:\n${planContext}\n\n` : ""
}User message: "${userMessage}"

Output:
IS_EDIT_REQUEST: [yes/no]
SAFETY: [safe/concern]
RELEVANCE: [yes/no]
EDIT_TYPE: [add_task/remove_task/modify_task/change_days_off/other/none]
DAY: [Monday-Sunday or "none"]
TIME_RANGE: [e.g., "6:00 AM - 7:00 AM" or "none"]
ACTIVITY: [activity name or "none"]
DAYS_OFF: [comma-separated days or "none"]
ANSWER: [Only if IS_EDIT_REQUEST=no and RELEVANCE=yes, provide helpful answer based on plan. Otherwise "none"]

Rules:
- IS_EDIT_REQUEST=yes ONLY if user explicitly wants to add/remove/change tasks or days off
- SAFETY=concern if message contains:
  * Self-harm or suicidal ideation (e.g., "kill myself", "end my life", "want to die")
  * Violence or harm to others
  * Dangerous or harmful wellness activities
  * Substance abuse or illegal activities
- RELEVANCE=no if completely unrelated to wellness/planning (jokes, random topics)
- IMPORTANT: Safety takes priority. If SAFETY=concern, set IS_EDIT_REQUEST=no, EDIT_TYPE=none, ANSWER=none
- Extract specific details (day, time, activity) ONLY when IS_EDIT_REQUEST=yes
- ANSWER: If IS_EDIT_REQUEST=no and RELEVANCE=yes, provide clear, concise answer using plan data. Use markdown formatting. Be friendly and helpful.

`;

    const content = await invokeLLM(prompt);

    // Parse structured output (key: value format)
    const lines = content.split("\n").filter((line) => line.trim());
    const parsed: Record<string, string> = {};

    for (const line of lines) {
      const match = line.match(/^([A-Z_]+):\s*(.+)$/);
      if (match) {
        parsed[match[1]] = match[2].trim();
      }
    }

    // Convert to EditAnalysisResult
    const analysis: EditAnalysisResult = {
      isEditRequest: parsed.IS_EDIT_REQUEST?.toLowerCase() === "yes",
      isSafe: parsed.SAFETY?.toLowerCase() === "safe",
      isRelevant: parsed.RELEVANCE?.toLowerCase() === "yes",
    };

    // Add edit type if it's an edit request
    if (analysis.isEditRequest && parsed.EDIT_TYPE !== "none") {
      analysis.editType = parsed.EDIT_TYPE as EditAnalysisResult["editType"];

      // Build extractedEdit object
      const extractedEdit: EditAnalysisResult["extractedEdit"] = {};

      if (parsed.DAY !== "none") extractedEdit.day = parsed.DAY;
      if (parsed.TIME_RANGE !== "none")
        extractedEdit.timeRange = parsed.TIME_RANGE;
      if (parsed.ACTIVITY !== "none") extractedEdit.activity = parsed.ACTIVITY;
      if (parsed.DAYS_OFF !== "none") {
        extractedEdit.daysOff = parsed.DAYS_OFF.split(",").map((d) => d.trim());
      }

      analysis.extractedEdit = extractedEdit;
    }

    // Extract answer if it's a query
    let answer: string | undefined;
    if (!analysis.isEditRequest && analysis.isRelevant && parsed.ANSWER) {
      // Multi-line answer support
      const answerIndex = lines.findIndex((line) => line.startsWith("ANSWER:"));
      if (answerIndex !== -1) {
        // Get all lines after ANSWER: that don't match key:value pattern
        const answerLines = [parsed.ANSWER]; // Start with first line after "ANSWER:"
        for (let i = answerIndex + 1; i < lines.length; i++) {
          const line = lines[i];
          // If line doesn't match KEY: pattern, it's part of the answer
          if (!line.match(/^[A-Z_]+:\s*.+$/)) {
            answerLines.push(line);
          } else {
            break; // Stop at next key
          }
        }
        answer =
          answerLines.join("\n").trim() !== "none"
            ? answerLines.join("\n").trim()
            : undefined;
      }
    }

    return { analysis, answer };
  } catch (error) {
    console.error("Error processing message:", error);
    // Default to safe query if processing fails
    return {
      analysis: {
        isEditRequest: false,
        isSafe: true,
        isRelevant: true,
      },
    };
  }
}
