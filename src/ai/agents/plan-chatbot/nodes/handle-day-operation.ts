import type { PlanChatbotStateType } from "../state";

/**
 * Multi-step day operation handler node
 * Handles operations that require multiple user interactions
 */
export async function handleDayOperationNode(): Promise<
  Partial<PlanChatbotStateType>
> {
  // console.log("\n📅 [handleDayOperationNode] START");

  // This node can be used for future enhancements
  // Currently, all day operations are handled in analyze node
  // This node is a placeholder for complex multi-step operations

  // For now, just pass through
  return {};
}

/**
 * Check if a day operation is supported
 */
export function isDayOperationSupported(
  operation: string,
  userMessage: string,
): { supported: boolean; message?: string } {
  const supportedOps = [
    "add_days_off",
    "remove_days",
    "copy_day",
    "rename_day",
    "swap_days",
  ];

  if (supportedOps.includes(operation)) {
    return { supported: true };
  }

  // Check for unsupported operations patterns
  const unsupportedPatterns = [
    /add\s+\w+\s+to\s+(the\s+)?plan/i,
    /add\s+\w+\s+as\s+(a\s+)?day/i,
    /add\s+(a\s+)?new\s+day/i,
    /create\s+(a\s+)?new\s+day/i,
    /insert\s+(a\s+)?day/i,
    /merge\s+days/i,
    /combine\s+days/i,
    /split\s+day/i,
    /divide\s+day/i,
  ];

  for (const pattern of unsupportedPatterns) {
    if (pattern.test(userMessage)) {
      return {
        supported: false,
        message: "This type of day operation is not currently supported. ",
      };
    }
  }

  return { supported: true };
}
