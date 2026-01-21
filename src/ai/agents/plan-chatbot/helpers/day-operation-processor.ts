import type { EditAnalysisResult } from "../types";
import {
  validateAddDaysOff,
  validateRemoveDays,
  validateCopyDay,
  validateRenameDay,
  validateSwapDays,
} from "../utils/validate-day-operations";

/**
 * Process day operation requests and prepare for confirmation
 */
export async function processDayOperation(
  userId: string,
  analysis: EditAnalysisResult,
): Promise<
  | {
      shouldConfirm: true;
      pendingEdit: {
        type:
          | "add_days_off"
          | "remove_days"
          | "copy_day"
          | "rename_day"
          | "swap_days";
        data: Record<string, unknown>;
        description: string;
        preview?: {
          before?: string;
          after?: string;
          changes?: Array<{
            field: string;
            oldValue?: string;
            newValue: string;
          }>;
        };
      };
      confirmMessage: string;
    }
  | {
      shouldConfirm: false;
      errorMessage: string;
      needsClarification?: boolean;
      clarificationOperation?: string;
      clarificationContext?: Record<string, unknown>;
    }
> {
  const editType = analysis.editType!;
  const extractedEdit = analysis.extractedEdit!;

  console.log("  🔍 [processDayOperation] Type:", editType);
  console.log("  📦 [processDayOperation] Extracted edit:", extractedEdit);

  // Handle add_days_off
  if (editType === "add_days_off") {
    console.log("  ➕ [add_days_off] Processing add days off request");
    const daysToAdd = extractedEdit.daysToAdd || [];
    console.log("  📅 [add_days_off] daysToAdd:", daysToAdd);

    if (daysToAdd.length === 0) {
      console.log("  ⚠️ [add_days_off] No days specified");
      return {
        shouldConfirm: false,
        errorMessage:
          "Please specify which days you want to mark as days off. Example: 'Add Wednesday and Thursday as days off'",
      };
    }

    console.log("  ✅ [add_days_off] Days specified, validating");
    const validation = await validateAddDaysOff(userId, daysToAdd);
    if (!validation.isValid) {
      console.log("  ❌ [add_days_off] Validation failed:", validation.errors);
      return {
        shouldConfirm: false,
        errorMessage: validation.errors.join(" "),
      };
    }

    console.log("  ✅ [add_days_off] Validation passed");
    return {
      shouldConfirm: true,
      pendingEdit: {
        type: "add_days_off",
        data: { daysToAdd: validation.normalizedDays },
        description: `Mark ${validation.normalizedDays!.join(", ")} as days off`,
        preview: {
          changes: [
            {
              field: "Days Off",
              newValue: validation.normalizedDays!.join(", "),
            },
          ],
        },
      },
      confirmMessage: `⚠️ **Confirmation Required**\n\nYou want to mark **${validation.normalizedDays!.join(", ")}** as days off. These days won't have any scheduled tasks.\n\n**Important:** Once confirmed, you won't be able to retrieve tasks for these days automatically.\n\nDo you want to proceed?\n\n[CONFIRM_BUTTON][CANCEL_BUTTON]`,
    };
  }

  // Handle remove_days
  if (editType === "remove_days") {
    console.log("  🗑️ [remove_days] Processing remove request");
    const daysToRemove = extractedEdit.daysToRemove || [];
    console.log("  📅 [remove_days] daysToRemove:", daysToRemove);

    // If days not specified, ask user
    if (daysToRemove.length === 0) {
      console.log(
        "  ⚠️ [remove_days] Days not specified, requesting clarification",
      );
      return {
        shouldConfirm: false,
        errorMessage:
          "Which days would you like to remove from your plan? Please specify the day names.\n\nExample: 'Monday and Tuesday' or 'Remove Wednesday'",
        needsClarification: true,
        clarificationOperation: "remove_days",
        clarificationContext: {},
      };
    }

    console.log("  ✅ [remove_days] Days specified, validating");
    const validation = await validateRemoveDays(userId, daysToRemove);
    if (!validation.isValid) {
      console.log("  ❌ [remove_days] Validation failed:", validation.errors);
      let errorMsg = validation.errors.join(" ");

      // If some days don't exist but others do, provide helpful message
      if (validation.missingDays && validation.missingDays.length > 0) {
        const existingDays = validation.existingDays || [];
        if (existingDays.length > 0) {
          errorMsg += `\n\nThese days exist in your plan: ${existingDays.join(", ")}.\n\nDid you mean to remove those instead?`;
        }
      }

      return {
        shouldConfirm: false,
        errorMessage: errorMsg,
      };
    }

    console.log("  ✅ [remove_days] Validation passed");
    return {
      shouldConfirm: true,
      pendingEdit: {
        type: "remove_days",
        data: { daysToRemove: validation.normalizedDays },
        description: `Remove ${validation.normalizedDays!.join(", ")} from plan`,
        preview: {
          changes: [
            {
              field: "Days to Remove",
              oldValue: validation.normalizedDays!.join(", "),
              newValue: "Deleted",
            },
          ],
        },
      },
      confirmMessage: `⚠️ **Confirmation Required**\n\nYou want to remove **${validation.normalizedDays!.join(", ")}** from your plan. All tasks on these days will be permanently deleted.\n\nDo you want to proceed?\n\n[CONFIRM_BUTTON][CANCEL_BUTTON]`,
    };
  }

  // Handle copy_day
  if (editType === "copy_day") {
    console.log("  📋 [copy_day] Processing copy day request");
    const sourceDay = extractedEdit.sourceDay;
    let targetDays: string | string[] = extractedEdit.targetDay || "";

    // Support multiple target days from different fields
    if (!targetDays && extractedEdit.targetDays) {
      targetDays = extractedEdit.targetDays;
    }

    console.log(
      "  📅 [copy_day] sourceDay:",
      sourceDay,
      "targetDays:",
      targetDays,
    );

    if (!sourceDay || !targetDays) {
      console.log("  ⚠️ [copy_day] Missing source or target day(s)");
      return {
        shouldConfirm: false,
        errorMessage:
          "Please specify which day's plan you want to copy and to which day(s). Examples:\n" +
          "• 'Copy Monday to Tuesday'\n" +
          "• 'Use Monday's plan for Tuesday and Wednesday'\n" +
          "• 'Copy Monday to Tuesday, Wednesday and Thursday'",
      };
    }

    console.log("  ✅ [copy_day] Days specified, validating");
    const validation = await validateCopyDay(userId, sourceDay, targetDays);
    if (!validation.isValid) {
      console.log("  ❌ [copy_day] Validation failed:", validation.errors);
      return {
        shouldConfirm: false,
        errorMessage: validation.errors.join(" "),
      };
    }

    const [normalizedSource, ...normalizedTargets] = validation.normalizedDays!;
    const existingTargets = validation.existingDays || [];
    console.log(
      "  ✅ [copy_day] Validation passed, targets:",
      normalizedTargets,
      "existing:",
      existingTargets,
    );

    const targetList = normalizedTargets.join(", ");
    let confirmMessage = `⚠️ **Confirmation Required**\n\nYou want to copy **${normalizedSource}'s** plan to **${targetList}**.`;

    if (existingTargets.length > 0) {
      confirmMessage += `\n\n⚠️ **Warning:** ${existingTargets.length === 1 ? existingTargets[0] : `These days (${existingTargets.join(", ")})`} already ${existingTargets.length === 1 ? "has" : "have"} a plan. ${existingTargets.length === 1 ? "It" : "They"} will be replaced with ${normalizedSource}'s plan.`;
    }

    confirmMessage +=
      "\n\nDo you want to proceed?\n\n[CONFIRM_BUTTON][CANCEL_BUTTON]";

    return {
      shouldConfirm: true,
      pendingEdit: {
        type: "copy_day",
        data: {
          sourceDay: normalizedSource,
          targetDays: normalizedTargets,
          deleteExisting: existingTargets.length > 0,
          existingTargets,
        },
        description: `Copy ${normalizedSource} to ${targetList}`,
        preview: {
          changes: [
            {
              field: "Action",
              newValue: `Copy ${normalizedSource} → ${targetList}`,
            },
          ],
        },
      },
      confirmMessage,
    };
  }

  // Handle rename_day
  if (editType === "rename_day") {
    const oldDay = extractedEdit.sourceDay;
    const newDay = extractedEdit.targetDay;

    if (!oldDay || !newDay) {
      return {
        shouldConfirm: false,
        errorMessage:
          "Please specify the old day name and the new day name. Example: 'Change Monday to Tuesday'",
      };
    }

    const validation = await validateRenameDay(userId, oldDay, newDay);
    if (!validation.isValid) {
      return {
        shouldConfirm: false,
        errorMessage: validation.errors.join(" "),
      };
    }

    const [normalizedOld, normalizedNew] = validation.normalizedDays!;
    const newDayExists = validation.conflictingDays!.length > 0;

    let confirmMessage = `⚠️ **Confirmation Required**\n\nYou want to change **${normalizedOld}** to **${normalizedNew}**.`;

    if (newDayExists) {
      confirmMessage += `\n\n⚠️ **Warning:** ${normalizedNew} already has a plan. Your current ${normalizedNew}'s plan will be deleted upon confirmation.`;
    }

    confirmMessage +=
      "\n\nDo you want to proceed?\n\n[CONFIRM_BUTTON][CANCEL_BUTTON]";

    return {
      shouldConfirm: true,
      pendingEdit: {
        type: "rename_day",
        data: {
          oldDay: normalizedOld,
          newDay: normalizedNew,
          deleteExistingNew: newDayExists,
        },
        description: `Rename ${normalizedOld} to ${normalizedNew}`,
        preview: {
          changes: [
            {
              field: "Day Name",
              oldValue: normalizedOld,
              newValue: normalizedNew,
            },
          ],
        },
      },
      confirmMessage,
    };
  }

  // Handle swap_days
  if (editType === "swap_days") {
    console.log("  🔄 [swap_days] Processing swap request");
    let day1 = extractedEdit.day1 || extractedEdit.sourceDay;
    let day2 = extractedEdit.day2 || extractedEdit.targetDay;

    console.log("  📅 [swap_days] day1:", day1, "day2:", day2);

    // Fallback: check if days were extracted in other fields
    if (!day1 && !day2 && extractedEdit.daysToAdd) {
      console.log(
        "  🔧 [swap_days] Fallback: checking daysToAdd:",
        extractedEdit.daysToAdd,
      );
      const days = extractedEdit.daysToAdd;
      if (days.length === 2) {
        day1 = days[0];
        day2 = days[1];
        console.log(
          "  ✅ [swap_days] Extracted from fallback - day1:",
          day1,
          "day2:",
          day2,
        );
      }
    }

    if (!day1 || !day2) {
      console.log(
        "  ⚠️ [swap_days] Days not specified, requesting clarification",
      );
      return {
        shouldConfirm: false,
        errorMessage:
          "Please specify which two days you want to swap.\n\nExample: 'Swap Monday and Tuesday' or 'Interchange Monday with Tuesday'",
        needsClarification: true,
        clarificationOperation: "swap_days",
        clarificationContext: {},
      };
    }

    console.log("  ✅ [swap_days] Days specified, validating:", day1, day2);
    const validation = await validateSwapDays(userId, day1, day2);
    if (!validation.isValid) {
      console.log("  ❌ [swap_days] Validation failed:", validation.errors);
      return {
        shouldConfirm: false,
        errorMessage: validation.errors.join(" "),
      };
    }

    const [normalizedDay1, normalizedDay2] = validation.normalizedDays!;
    console.log(
      "  ✅ [swap_days] Validation passed:",
      normalizedDay1,
      normalizedDay2,
    );

    return {
      shouldConfirm: true,
      pendingEdit: {
        type: "swap_days",
        data: {
          day1: normalizedDay1,
          day2: normalizedDay2,
        },
        description: `Swap ${normalizedDay1} ↔ ${normalizedDay2}`,
        preview: {
          changes: [
            {
              field: "Action",
              newValue: `${normalizedDay1} ↔ ${normalizedDay2}`,
            },
          ],
        },
      },
      confirmMessage: `⚠️ **Confirmation Required**\n\nYou want to swap the plans of **${normalizedDay1}** and **${normalizedDay2}**.\n\n${normalizedDay1}'s tasks will move to ${normalizedDay2}, and vice versa.\n\nDo you want to proceed?\n\n[CONFIRM_BUTTON][CANCEL_BUTTON]`,
    };
  }

  console.log(
    "  ❌ [processDayOperation] Unknown/unsupported operation:",
    editType,
  );
  return {
    shouldConfirm: false,
    errorMessage:
      "This day operation is not currently supported. Supported operations:\n\n" +
      "• Add days off\n" +
      "• Remove days from plan\n" +
      "• Copy a day's plan to another day\n" +
      "• Rename a day\n" +
      "• Swap two days\n\n" +
      "Please try one of these operations or edit your plan manually.",
  };
}
