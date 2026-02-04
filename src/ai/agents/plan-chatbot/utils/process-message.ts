import type { EditAnalysisResult } from "../types";
import { invokeLLM } from "./llm-service";
import { retrievePlanFromEmbeddings } from "./retrieve-plan";
import { buildProcessMessagePrompt } from "./prompts";
import type { BaseMessage } from "@langchain/core/messages";

/**
 * Combined message processing - analyzes intent and answers query in single LLM call
 */
export async function processUserMessage(
  userMessage: string,
  userId: string,
  conversationHistory?: BaseMessage[],
): Promise<{
  analysis: EditAnalysisResult;
  answer?: string;
}> {
  try {
    // Get plan context first
    const planContext = await retrievePlanFromEmbeddings(userId);

    // Build conversation context from history if provided
    let conversationContext = "";
    if (conversationHistory && conversationHistory.length > 0) {
      const historyLines = conversationHistory
        .slice(-10) // Limit to last 10 messages to avoid token bloat
        .map((msg) => {
          const content =
            typeof msg.content === "string"
              ? msg.content
              : JSON.stringify(msg.content);
          const role = msg._getType() === "human" ? "User" : "Assistant";
          return `${role}: ${content}`;
        });
      conversationContext =
        "Conversation history:\n" + historyLines.join("\n") + "\n\n";
      console.log(
        `  📋 Including ${historyLines.length} previous messages for context`,
      );
    }

    const prompt = buildProcessMessagePrompt(
      userMessage,
      planContext ?? undefined,
      conversationContext || undefined,
    );

    console.log("  🤖 Invoking LLM...");
    const content = await invokeLLM(prompt);

    // Parse structured output (key: value format)
    const lines = content.split("\n").filter((line) => line.trim());
    const parsed: Record<string, string> = {};
    console.log("  📄 LLM Response:\n", content);
    for (const line of lines) {
      // Updated regex to include digits for DAY1, DAY2, etc.
      const match = line.match(/^([A-Z0-9_]+):\s*(.+)$/);
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

      // Handle MODIFY_TYPE for modify_task
      if (
        parsed.MODIFY_TYPE &&
        parsed.MODIFY_TYPE !== "none" &&
        ["title", "notes", "status"].includes(parsed.MODIFY_TYPE)
      ) {
        extractedEdit.modifyType = parsed.MODIFY_TYPE as
          | "title"
          | "notes"
          | "status";
      } else if (parsed.MODIFY_TYPE === "none") {
        // Set modifyType to "none" so validation can reject unsupported modifications
        extractedEdit.modifyType = "none";
      }

      // Handle STATUS for modify_task when MODIFY_TYPE is status
      if (
        parsed.STATUS &&
        parsed.STATUS !== "none" &&
        parsed.MODIFY_TYPE === "status" &&
        ["pending", "done", "partial"].includes(parsed.STATUS)
      ) {
        extractedEdit.status = parsed.STATUS as "pending" | "done" | "partial";
      }

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

      // Parse day operation fields
      if (parsed.SOURCE_DAY && parsed.SOURCE_DAY !== "none") {
        extractedEdit.sourceDay = parsed.SOURCE_DAY;
      }
      if (parsed.TARGET_DAY && parsed.TARGET_DAY !== "none") {
        // Support multiple target days (comma-separated) for copy_day
        const targetDayValue = parsed.TARGET_DAY.trim();
        if (targetDayValue.includes(",")) {
          // Multiple targets - parse as array
          extractedEdit.targetDays = targetDayValue
            .split(",")
            .map((d) => d.trim());
        } else {
          // Single target - keep backward compatibility
          extractedEdit.targetDay = targetDayValue;
        }
      }
      if (parsed.DAYS_TO_ADD && parsed.DAYS_TO_ADD !== "none") {
        extractedEdit.daysToAdd = parsed.DAYS_TO_ADD.split(",").map((d) =>
          d.trim(),
        );
      }
      if (parsed.DAYS_TO_REMOVE && parsed.DAYS_TO_REMOVE !== "none") {
        extractedEdit.daysToRemove = parsed.DAYS_TO_REMOVE.split(",").map((d) =>
          d.trim(),
        );
      }
      if (parsed.DAY1 && parsed.DAY1 !== "none") {
        extractedEdit.day1 = parsed.DAY1;
      }
      if (parsed.DAY2 && parsed.DAY2 !== "none") {
        extractedEdit.day2 = parsed.DAY2;
      }

      analysis.extractedEdit = extractedEdit;
      console.log("  ✏️ Edit extracted:", extractedEdit);

      // Detect multiple operations if multiple operation fields are filled
      const operationCount = [
        extractedEdit.daysToAdd?.length ? 1 : 0,
        extractedEdit.daysToRemove?.length ? 1 : 0,
        extractedEdit.day1 && extractedEdit.day2 ? 1 : 0,
        extractedEdit.sourceDay && extractedEdit.targetDay ? 1 : 0,
        extractedEdit.activity || extractedEdit.oldActivity ? 1 : 0,
      ].reduce((sum, count) => sum + count, 0);

      if (operationCount > 1) {
        console.log(
          "  ⚠️ MULTIPLE OPERATIONS DETECTED - operationCount:",
          operationCount,
        );
        analysis.editType = "other";
        analysis.extractedEdit = undefined;
      }
    }

    // Extract answer only for queries (not for edit requests)
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
