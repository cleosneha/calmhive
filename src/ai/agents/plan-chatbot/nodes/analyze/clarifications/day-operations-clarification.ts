import type { PlanChatbotStateType } from "../../../state";
import { AIMessage } from "@langchain/core/messages";
import { validateDayOperation } from "../validation";

export async function handleDayOperationsClarification(
  state: PlanChatbotStateType,
  userMessage: string,
): Promise<Partial<PlanChatbotStateType>> {
  console.log("  📅 DAY OPERATIONS CLARIFICATION");

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

  const operation = state.awaitingClarification.operation;
  const context = state.awaitingClarification.context;

  console.log("  📋 Operation:", operation);
  console.log("  💬 User clarification:", userMessage);

  // Handle "cancel" or similar
  if (
    userMessage.toLowerCase().trim() === "cancel" ||
    userMessage.toLowerCase().trim() === "abort" ||
    userMessage.toLowerCase().trim() === "stop"
  ) {
    return {
      messages: [new AIMessage("Operation cancelled.")],
      awaitingClarification: null,
    };
  }

  // Extract days from user message
  const days = extractDaysFromMessage(userMessage);
  console.log("  📅 Extracted days:", days);

  if (days.length === 0) {
    return {
      messages: [
        new AIMessage(
          `I couldn't identify any days from "${userMessage}". Please specify day names like:\n` +
            `• "Monday and Tuesday"\n` +
            `• "Remove Wednesday"\n` +
            `• "Swap Monday with Tuesday"\n\n` +
            `Or say "cancel" to abort.`,
        ),
      ],
      awaitingClarification: state.awaitingClarification, // Keep waiting
    };
  }

  // Create complete edit analysis based on operation type
  let completeEdit: any = {};

  switch (operation) {
    case "remove_days":
      completeEdit = {
        daysToRemove: days,
      };
      break;

    case "add_days_off":
      completeEdit = {
        daysToAdd: days,
      };
      break;

    case "swap_days":
      if (days.length < 2) {
        return {
          messages: [
            new AIMessage(
              `For swapping days, I need two days. You mentioned: ${days.join(", ")}. Please specify both days to swap.`,
            ),
          ],
          awaitingClarification: state.awaitingClarification,
        };
      }
      completeEdit = {
        day1: days[0],
        day2: days[1],
      };
      break;

    case "copy_day":
      if (days.length < 2) {
        return {
          messages: [
            new AIMessage(
              `For copying a day, I need the source day and target day. You mentioned: ${days.join(", ")}. Please specify both days.`,
            ),
          ],
          awaitingClarification: state.awaitingClarification,
        };
      }
      completeEdit = {
        sourceDay: days[0],
        targetDay: days[1],
      };
      break;

    case "rename_day":
      if (days.length < 2) {
        return {
          messages: [
            new AIMessage(
              `For renaming a day, I need the current name and new name. You mentioned: ${days.join(", ")}. Please specify both names.`,
            ),
          ],
          awaitingClarification: state.awaitingClarification,
        };
      }
      completeEdit = {
        oldName: days[0],
        newName: days[1],
      };
      break;

    default:
      return {
        messages: [
          new AIMessage(
            `Unknown day operation: ${operation}. Please start over.`,
          ),
        ],
        awaitingClarification: null,
      };
  }

  console.log("  ✅ Complete edit:", completeEdit);

  // Create a mock analysis result for validation
  const mockAnalysis = {
    isEditRequest: true,
    isSafe: true,
    isRelevant: true,
    editType: operation as any,
    extractedEdit: completeEdit,
  };

  // Validate and process the complete operation
  const validationResult = await validateDayOperation(state, mockAnalysis);

  if (!validationResult.isValid) {
    // If validation fails, ask for clarification again
    return {
      messages: [
        new AIMessage(
          `I couldn't complete the operation: ${validationResult.response.messages?.[0]?.content || "Unknown error"}. Please try again or say "cancel".`,
        ),
      ],
      awaitingClarification: state.awaitingClarification, // Keep waiting
    };
  }

  // Success - return the validation response
  return validationResult.response;
}

/**
 * Extract day names from user clarification message
 */
function extractDaysFromMessage(message: string): string[] {
  const cleanMessage = message.toLowerCase().trim();

  // Common day names
  const dayNames = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
    "sat",
    "sun",
  ];

  const foundDays: string[] = [];

  // Split message into words and check each word
  const words = cleanMessage.split(/\s+/);
  for (const word of words) {
    const cleanWord = word.replace(/[^\w]/g, "");
    if (dayNames.includes(cleanWord)) {
      // Convert abbreviations to full names
      const fullName = getFullDayName(cleanWord);
      if (!foundDays.includes(fullName)) {
        foundDays.push(fullName);
      }
    }
  }

  return foundDays;
}

/**
 * Convert day abbreviation to full name
 */
function getFullDayName(day: string): string {
  const mapping: Record<string, string> = {
    mon: "monday",
    tue: "tuesday",
    wed: "wednesday",
    thu: "thursday",
    fri: "friday",
    sat: "saturday",
    sun: "sunday",
  };

  return mapping[day] || day;
}
