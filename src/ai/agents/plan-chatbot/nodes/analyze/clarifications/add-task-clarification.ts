import type { PlanChatbotStateType } from "../../../state";
import { AIMessage } from "@langchain/core/messages";
import { validateAddTask } from "../validation";

export async function handleAddTaskClarification(
  state: PlanChatbotStateType,
  userMessage: string,
): Promise<Partial<PlanChatbotStateType>> {
  console.log("  📝 ADD TASK CLARIFICATION");

  if (!state.awaitingClarification?.context) {
    return {
      messages: [
        new AIMessage(
          "Something went wrong with the clarification. Please start over.",
        ),
      ],
      awaitingClarification: null,
    };
  }

  const context = state.awaitingClarification.context;
  const originalActivity = context.activity as string;
  const originalDay = context.day as string;
  const originalNotes = context.notes as string;

  console.log("  📋 Original context:", {
    originalActivity,
    originalDay,
    originalNotes,
  });
  console.log("  💬 User clarification:", userMessage);

  // Parse time from user message
  const timeRange = extractTimeFromMessage(userMessage);
  console.log("  ⏰ Extracted time range:", timeRange);

  if (!timeRange) {
    return {
      messages: [
        new AIMessage(
          `I couldn't understand the time from "${userMessage}". Please provide a time range like:\n` +
            `• "8:00 AM to 9:00 AM"\n` +
            `• "from 2 to 3 PM"\n` +
            `• "7:30-8:30"\n\n` +
            `Or say "cancel" to abort.`,
        ),
      ],
      awaitingClarification: state.awaitingClarification, // Keep waiting for clarification
    };
  }

  // Create complete edit analysis
  const completeEdit = {
    day: originalDay,
    timeRange: timeRange,
    activity: originalActivity,
    notes: originalNotes,
  };

  console.log("  ✅ Complete edit:", completeEdit);

  // Create a mock analysis result for validation
  const mockAnalysis = {
    isEditRequest: true,
    isSafe: true,
    isRelevant: true,
    editType: "add_task" as const,
    extractedEdit: completeEdit,
  };

  // Validate and process the complete task
  const validationResult = await validateAddTask(state, mockAnalysis);

  if (!validationResult.isValid) {
    // If validation fails, ask for clarification again
    return {
      messages: [
        new AIMessage(
          `I couldn't add the task: ${validationResult.response.messages?.[0]?.content || "Unknown error"}. Please try again or say "cancel".`,
        ),
      ],
      awaitingClarification: state.awaitingClarification, // Keep waiting
    };
  }

  // Success - return the validation response
  return validationResult.response;
}

/**
 * Extract time range from user clarification message
 */
function extractTimeFromMessage(message: string): string | null {
  const cleanMessage = message.toLowerCase().trim();

  // Handle "cancel" or similar
  if (
    cleanMessage === "cancel" ||
    cleanMessage === "abort" ||
    cleanMessage === "stop"
  ) {
    return null; // Special case handled above
  }

  // Common patterns for time ranges
  const patterns = [
    // "from 8 to 8:30" or "from 8:00 to 8:30"
    /from\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s+to\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i,
    // "8 to 8:30" or "8:00 to 8:30"
    /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s+to\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i,
    // "8-8:30" or "8:00-8:30"
    /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i,
  ];

  for (const pattern of patterns) {
    const match = cleanMessage.match(pattern);
    if (match) {
      const startTime = match[1].trim();
      const endTime = match[2].trim();

      // Normalize to 24-hour format if needed
      const normalizedStart = normalizeTimeString(startTime);
      const normalizedEnd = normalizeTimeString(endTime);

      if (normalizedStart && normalizedEnd) {
        return `${normalizedStart}-${normalizedEnd}`;
      }
    }
  }

  return null;
}

/**
 * Normalize a time string to include AM/PM if missing
 */
function normalizeTimeString(timeStr: string): string | null {
  const clean = timeStr.replace(/\s+/g, "").toLowerCase();

  // If it already has AM/PM, return as-is
  if (clean.includes("am") || clean.includes("pm")) {
    return timeStr.trim();
  }

  // If it's just a number (like "8"), assume AM for morning times
  const hourMatch = clean.match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (hourMatch) {
    const hour = parseInt(hourMatch[1]);
    const minute = hourMatch[2] || "00";

    // Assume AM for hours 6-11, PM for 12-23
    const period = hour >= 6 && hour <= 11 ? "AM" : "PM";
    return `${hour}:${minute} ${period}`;
  }

  return null;
}
