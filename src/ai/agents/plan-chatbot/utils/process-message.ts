import type { EditAnalysisResult } from "../types";
import { invokeLLM } from "./llm-service";
import { retrievePlanFromEmbeddings } from "./retrieve-plan";
import { buildProcessMessagePrompt } from "./prompts";

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

    const prompt = buildProcessMessagePrompt(
      userMessage,
      planContext ?? undefined
    );

    console.log("  🤖 Invoking LLM...");
    const content = await invokeLLM(prompt);

    // Parse structured output (key: value format)
    const lines = content.split("\n").filter((line) => line.trim());
    const parsed: Record<string, string> = {};
    console.log("  📄 LLM Response:\n", content);
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

      // Handle OLD_ACTIVITY and NEW_ACTIVITY for proper change tracking
      if (parsed.OLD_ACTIVITY && parsed.OLD_ACTIVITY !== "none") {
        extractedEdit.oldActivity = parsed.OLD_ACTIVITY;
      }
      if (parsed.NEW_ACTIVITY && parsed.NEW_ACTIVITY !== "none") {
        extractedEdit.activity = parsed.NEW_ACTIVITY;
      }

      // Add notes if provided (ALWAYS include for add/modify tasks)
      // Support multi-line NOTES blocks by collecting lines after the NOTES: key
      const notesIndex = lines.findIndex((line) => line.startsWith("NOTES:"));
      if (notesIndex !== -1) {
        const noteLines: string[] = [];
        // First line may contain content after `NOTES:`
        const firstLineContent = lines[notesIndex].replace(/^NOTES:\s*/i, "");
        if (firstLineContent) noteLines.push(firstLineContent);

        // Collect subsequent lines until next KEY: value line
        for (let i = notesIndex + 1; i < lines.length; i++) {
          const line = lines[i];
          if (line.match(/^[A-Z_]+:\s*.+$/)) break; // next key
          noteLines.push(line);
        }

        const notesCombined = noteLines.join("\n").trim();
        if (notesCombined && notesCombined.toLowerCase() !== "none") {
          extractedEdit.notes = notesCombined;
          console.log("  📝 Notes extracted:", extractedEdit.notes);
        } else {
          console.log("  ⚠️ NOTES not found or set to 'none'");
        }
      } else {
        console.log("  ⚠️ NOTES not found or set to 'none'");
      }

      if (parsed.DAYS_OFF && parsed.DAYS_OFF !== "none") {
        extractedEdit.daysOff = parsed.DAYS_OFF.split(",").map((d) => d.trim());
      }

      analysis.extractedEdit = extractedEdit;
      console.log("  ✏️ Edit extracted:", extractedEdit);
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

    // Check if quota exceeded
    const errorMessage = error instanceof Error ? error.message : "";
    const isQuotaExceeded =
      errorMessage.includes("429") ||
      errorMessage.includes("quota") ||
      errorMessage.includes("Too Many Requests");

    return {
      analysis: {
        isEditRequest: false,
        isSafe: true,
        isRelevant: true,
        quotaExceeded: isQuotaExceeded,
      },
    };
  }
}
