import type { PlanChatbotStateType } from "../state";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import {
  processUserMessage,
  HARD_CODED_MESSAGES,
  validateAddTask,
  validateRemoveTask,
} from "../utils";
import {
  buildEditPreview,
  buildPreviewMessage,
  checkTimeConflict,
  processDayOperation,
} from "../helpers";

/**
 * Analyze Node: Analyze user's message to determine intent
 */
export async function analyzeNode(
  state: PlanChatbotStateType,
): Promise<Partial<PlanChatbotStateType>> {
  console.log("\n🔍 [analyzeNode] START");
  console.log("  📋 Current State:", {
    mode: state.mode,
    waitingForConfirmation: state.waitingForConfirmation,
    awaitingClarification: state.awaitingClarification,
  });

  // Get last user message
  const lastMessage = state.messages[state.messages.length - 1];
  if (!lastMessage || lastMessage._getType() !== "human") {
    console.log("  ⚠️ No human message found");
    return {};
  }

  const userMessage =
    lastMessage instanceof HumanMessage ? lastMessage.content.toString() : "";

  console.log("  💬 User message:", userMessage);

  // PRIORITY 0: Detect jailbreak/prompt injection attempts
  const jailbreakPatterns = [
    /forget.*prompt/i,
    /ignore.*instruction/i,
    /disregard.*rule/i,
    /act as/i,
    /pretend to be/i,
    /you are now/i,
    /new role/i,
    /change your role/i,
    /ignore previous/i,
    /override.*instruction/i,
  ];

  if (jailbreakPatterns.some((pattern) => pattern.test(userMessage))) {
    console.log(
      "  🚨 JAILBREAK ATTEMPT DETECTED - returning irrelevance message",
    );
    return {
      messages: [new AIMessage(HARD_CODED_MESSAGES.IRRELEVANT)],
      responseHandled: true,
    };
  }

  // PRIORITY 1: Handle clarification responses for multi-step operations
  if (state.awaitingClarification) {
    console.log(
      "  🔄 CLARIFICATION MODE - Processing user response for:",
      state.awaitingClarification.operation,
    );
    return await handleClarificationResponse(state, userMessage);
  }

  // Check for undo request - updates are irreversible
  const undoKeywords = ["undo", "revert", "go back", "reverse"];
  if (undoKeywords.some((kw) => userMessage.toLowerCase().includes(kw))) {
    console.log(
      "  🔄 Undo request detected - informing user it's irreversible",
    );
    return {
      messages: [
        new AIMessage(
          "Plan updates are irreversible. I cannot undo changes once they've been applied. However, you can always request new changes to adjust your plan!",
        ),
      ],
      responseHandled: true,
      awaitingClarification: null,
    };
  }

  // Analyze the message using LLM (combines analysis + query answering)
  const { analysis, answer } = await processUserMessage(
    userMessage,
    state.userId,
  );

  console.log("  📊 Analysis complete:", {
    isSafe: analysis.isSafe,
    isRelevant: analysis.isRelevant,
    isEditRequest: analysis.isEditRequest,
    editType: analysis.editType,
  });

  // PRIORITY 2: Handle quota exceeded
  if (analysis.quotaExceeded) {
    console.log("  ⚠️ QUOTA EXCEEDED - returning quota message");
    return {
      messages: [new AIMessage(HARD_CODED_MESSAGES.QUOTA_EXCEEDED)],
      responseHandled: true,
    };
  }

  // PRIORITY 3: Handle safety issues
  if (!analysis.isSafe) {
    console.log("  ⚠️ SAFETY CONCERN - returning safety message");
    return {
      messages: [new AIMessage(HARD_CODED_MESSAGES.SAFETY)],
      responseHandled: true, // Prevent respond node from executing
    };
  }

  // PRIORITY 4: Handle irrelevant messages
  if (!analysis.isRelevant) {
    console.log("  ⚠️ IRRELEVANT - returning irrelevance message");
    return {
      messages: [new AIMessage(HARD_CODED_MESSAGES.IRRELEVANT)],
      responseHandled: true, // Prevent respond node from executing
    };
  }

  // PRIORITY 5: Handle edit requests with confirmation
  if (analysis.isEditRequest) {
    console.log("  ✏️ EDIT REQUEST - preparing confirmation");

    // Check for unsupported edit types or multiple operations FIRST
    if (analysis.editType === "other" || !analysis.editType) {
      console.log("  ❌ UNSUPPORTED EDIT TYPE OR MULTIPLE OPERATIONS");

      return {
        mode: "query",
        messages: [
          new AIMessage(
            "I can only process **one operation at a time**. \n\n" +
              "**Currently supported operations:**\n" +
              "• Add/remove/modify tasks\n" +
              "• Mark days as off\n" +
              "• Remove days from plan\n" +
              "• Copy/rename/swap days\n" +
              "• Delete entire plan\n\n" +
              "Please specify which single operation you'd like me to perform.",
          ),
        ],
        responseHandled: true,
      };
    }

    // Now check if extractedEdit exists for valid edit types
    if (!analysis.extractedEdit) {
      console.log("  ❌ No extractedEdit found");
      return {
        mode: "query",
        messages: [
          new AIMessage(
            "I couldn't extract the edit details. Please try again.",
          ),
        ],
        responseHandled: true,
      };
    }

    // Handle day operations (add_days_off, remove_days, copy_day, rename_day, swap_days)
    const dayOperations = [
      "add_days_off",
      "remove_days",
      "copy_day",
      "rename_day",
      "swap_days",
    ];
    if (analysis.editType && dayOperations.includes(analysis.editType)) {
      console.log(`  📅 DAY OPERATION: ${analysis.editType}`);
      const result = await processDayOperation(state.userId, analysis);

      if (!result.shouldConfirm) {
        console.log("  ⚠️ Day operation needs handling");

        // Check if we need clarification
        if (result.needsClarification) {
          console.log("  🔄 Setting awaiting clarification state");
          return {
            messages: [new AIMessage(result.errorMessage)],
            responseHandled: true,
            awaitingClarification: {
              operation: result.clarificationOperation as
                | "swap_days"
                | "remove_days"
                | "copy_day"
                | "rename_day",
              context: result.clarificationContext,
            },
          };
        }

        // Regular error
        return {
          mode: "query",
          messages: [new AIMessage(result.errorMessage)],
          responseHandled: true,
          awaitingClarification: null,
        };
      }

      console.log("  ✅ Day operation validated, showing confirmation");
      return {
        waitingForConfirmation: true,
        pendingEdit: result.pendingEdit,
        messages: [new AIMessage(result.confirmMessage)],
        awaitingClarification: null,
      };
    }

    // Handle delete_plan operation
    if (analysis.editType === "delete_plan") {
      console.log("  🗑️ DELETE PLAN REQUEST");

      return {
        waitingForConfirmation: true,
        pendingEdit: {
          type: "delete_plan",
          data: {},
          description: "Delete entire plan",
          preview: {
            changes: [
              {
                field: "Plan",
                oldValue: "All tasks and plan data",
                newValue: "Deleted",
              },
            ],
          },
        },
        messages: [
          new AIMessage(
            "⚠️ **Confirmation Required**\n\n" +
              "You want to **delete your entire plan**. This will:\n" +
              "• Remove all tasks from all days\n" +
              "• Delete all plan data\n" +
              "• Clear your wellness plan history\n\n" +
              "**⚠️ WARNING: This action is IRREVERSIBLE. All your plan data will be permanently lost.**\n\n" +
              "Are you absolutely sure you want to proceed?\n\n[CONFIRM_BUTTON][CANCEL_BUTTON]",
          ),
        ],
        awaitingClarification: null,
      };
    }

    // Check for unsupported edit types or multiple operations
    if (!analysis.editType || (analysis.editType as string) === "other") {
      console.log("  ❌ UNSUPPORTED EDIT TYPE OR MULTIPLE OPERATIONS");

      return {
        mode: "query",
        messages: [
          new AIMessage(
            "I can only process **one operation at a time**. \n\n" +
              "**Currently supported operations:**\n" +
              "• Add/remove/modify tasks\n" +
              "• Mark days as off\n" +
              "• Remove days from plan\n" +
              "• Copy/rename/swap days\n" +
              "• Delete entire plan\n\n" +
              "Please specify which single operation you'd like me to perform.",
          ),
        ],
        responseHandled: true,
      };
    }

    // VALIDATION FOR ADD_TASK
    if (analysis.editType === "add_task") {
      const { day, timeRange, activity } = analysis.extractedEdit;

      // Check for vague time range first
      if (timeRange === "vague" || !timeRange) {
        console.log("  ⚠️ ADD_TASK - vague or missing time range");
        return {
          mode: "query",
          messages: [
            new AIMessage(
              `I'd be happy to add **${activity || "this activity"}** to your plan${day ? ` on **${day}**` : ""}! \n\n` +
                `However, I need a specific time slot. Please provide:\n` +
                `- **Exact time range** (e.g., "7:00 AM - 8:00 AM")${!day ? "\n- **Which day** (e.g., Monday, Tuesday, etc.)" : ""}\n\n` +
                `Example: "Add it on Monday from 7:00 AM to 8:00 AM"`,
            ),
          ],
          responseHandled: true,
          awaitingClarification: {
            operation: "add_task",
            context: {
              activity,
              day,
              notes: analysis.extractedEdit.notes,
            },
          },
        };
      }

      // Check if all required fields are present
      if (!day || !activity) {
        console.log("  ❌ ADD_TASK - missing required fields");
        const missingFields = [];
        if (!day) missingFields.push("day");
        if (!activity) missingFields.push("activity title");

        return {
          mode: "query",
          messages: [
            new AIMessage(
              `I need more information to add this task. Please provide:\n${missingFields.map((f) => `- ${f}`).join("\n")}\n\nExample: "Add morning yoga on Monday from 7:00 AM to 8:00 AM"`,
            ),
          ],
          responseHandled: true,
        };
      }

      // Validate the task data
      const validation = await validateAddTask(
        state.userId,
        day,
        timeRange,
        activity,
      );

      if (!validation.isValid) {
        console.log("  ❌ ADD_TASK - validation failed:", validation.errors);
        return {
          mode: "query",
          messages: [
            new AIMessage(
              `**Cannot add this task.** ${validation.errors.join(" ")}\n\nPlease try again with valid information.`,
            ),
          ],
          responseHandled: true,
        };
      }

      // Use normalized day from validation
      if (validation.normalizedDay) {
        analysis.extractedEdit.day = validation.normalizedDay;
      }

      // Check for similar activities on the same day
      if (
        typeof analysis.extractedEdit.day === "string" &&
        typeof analysis.extractedEdit.activity === "string"
      ) {
        const { checkSimilarActivities } =
          await import("../utils/validate-add-task");
        const similarCheck = await checkSimilarActivities(
          state.userId,
          analysis.extractedEdit.day,
          analysis.extractedEdit.activity,
        );

        if (similarCheck.hasSimilar && similarCheck.similarActivities) {
          console.log("  ℹ️ SIMILAR ACTIVITY FOUND - rejecting addition");
          const similarList = similarCheck.similarActivities
            .map((a) => `• **${a.activity}** at ${a.timeRange}`)
            .join("\n");

          return {
            mode: "query",
            messages: [
              new AIMessage(
                `I can't add **${analysis.extractedEdit.activity}** on **${analysis.extractedEdit.day}** because you already have a similar activity on that day:\n\n${similarList}\n\n` +
                  `Please choose a different day or let me know if you'd like to replace the existing activity instead.`,
              ),
            ],
            responseHandled: true,
          };
        }
      }

      // Check for time conflicts (now checks for overlapping times)
      if (
        typeof analysis.extractedEdit.day === "string" &&
        typeof analysis.extractedEdit.timeRange === "string"
      ) {
        const conflictCheck = await checkTimeConflict(
          state.userId,
          analysis.extractedEdit.day,
          analysis.extractedEdit.timeRange,
        );

        if (conflictCheck.hasConflict) {
          console.log("  ⚠️ TIME CONFLICT DETECTED - overlapping times");
          return {
            mode: "query",
            messages: [
              new AIMessage(
                `**Cannot add this task.** There's already a **${conflictCheck.conflictingActivity}** scheduled on **${analysis.extractedEdit.day}** at **${conflictCheck.conflictingTime || analysis.extractedEdit.timeRange}** that overlaps with your requested time.\n\nPlease choose a different time slot that doesn't overlap with existing activities.`,
              ),
            ],
            responseHandled: true,
          };
        }
      }
    }

    // VALIDATION FOR REMOVE_TASK
    if (analysis.editType === "remove_task") {
      const { oldActivity, day, timeRange } = analysis.extractedEdit;

      // Check if activity is provided
      if (!oldActivity) {
        console.log("  ❌ REMOVE_TASK - missing activity name");
        return {
          mode: "query",
          messages: [
            new AIMessage(
              'I need to know which task you want to remove. Please specify the activity name.\n\nExample: "Remove morning yoga" or "Delete the 7 AM workout"',
            ),
          ],
          responseHandled: true,
        };
      }

      // Validate and find the task
      const validation = await validateRemoveTask(
        state.userId,
        oldActivity,
        day,
        timeRange,
      );

      if (!validation.isValid) {
        console.log("  ❌ REMOVE_TASK - validation failed:", validation.error);
        return {
          mode: "query",
          messages: [
            new AIMessage(
              `**Cannot remove this task.** ${validation.error}\n\nPlease check your plan and try again.`,
            ),
          ],
          responseHandled: true,
        };
      }

      // Store the full task details and isLastTask flag for preview
      analysis.extractedEdit.taskId = validation.taskId;
      analysis.extractedEdit.activity = validation.taskActivity;
      analysis.extractedEdit.day = validation.taskDay;
      analysis.extractedEdit.timeRange = validation.taskTimeRange;
      analysis.extractedEdit.isLastTask = validation.isLastTask;
    }

    // Check for time conflicts if it's a modify_task with time change
    if (
      analysis.editType === "modify_task" &&
      analysis.extractedEdit.timeRange &&
      analysis.extractedEdit.day
    ) {
      const conflictCheck = await checkTimeConflict(
        state.userId,
        analysis.extractedEdit.day,
        analysis.extractedEdit.timeRange,
        analysis.extractedEdit.oldActivity,
      );

      if (conflictCheck.hasConflict) {
        console.log("  ⚠️ TIME CONFLICT DETECTED - overlapping times");
        return {
          mode: "query",
          messages: [
            new AIMessage(
              `**Cannot make this change.** There's already a **${conflictCheck.conflictingActivity}** scheduled on **${analysis.extractedEdit.day}** at **${conflictCheck.conflictingTime || analysis.extractedEdit.timeRange}** that would overlap.\n\nPlease choose a different time slot or remove the conflicting activity first.`,
            ),
          ],
          responseHandled: true,
        };
      }
    }

    // Build preview and message
    const preview = buildEditPreview(analysis);
    const previewMessage = buildPreviewMessage(analysis);

    return {
      waitingForConfirmation: true,
      pendingEdit: {
        type: analysis.editType || "other",
        data: analysis.extractedEdit,
        description: previewMessage,
        preview,
      },
      messages: [new AIMessage(previewMessage)],
      awaitingClarification: null, // Clear any clarification state
    };
  }

  // PRIORITY 4: Handle queries - pass answer to respond node
  console.log("  💬 QUERY - passing to respond node");
  return {
    mode: "query",
    cachedAnswer: answer,
    awaitingClarification: null, // Clear any clarification state
  };
}

/**
 * Handle user responses when we're awaiting clarification
 */
async function handleClarificationResponse(
  state: PlanChatbotStateType,
  userMessage: string,
): Promise<Partial<PlanChatbotStateType>> {
  const { operation, context } = state.awaitingClarification!;
  console.log("  🔍 Processing clarification for:", operation);
  console.log("  📦 Context:", context);

  // Route to appropriate handler based on operation
  switch (operation) {
    case "add_task":
      // add_task handles its own parsing (day and time)
      return await handleAddTaskClarification(state, userMessage);

    case "swap_days":
    case "remove_days": {
      // Parse day names from user response for day operations
      const parsedDays = parseDayNames(userMessage);
      console.log("  📅 Parsed days from response:", parsedDays);

      if (parsedDays.length === 0) {
        console.log("  ❌ No valid day names found in response");
        return {
          messages: [
            new AIMessage(
              "I couldn't find any valid day names in your response. Please specify day names like Monday, Tuesday, etc.",
            ),
          ],
          responseHandled: true,
          // Keep awaiting clarification
        };
      }

      if (operation === "swap_days") {
        return await handleSwapDaysClarification(state.userId, parsedDays);
      } else {
        return await handleRemoveDaysClarification(state.userId, parsedDays);
      }
    }

    default:
      console.log("  ⚠️ Unknown clarification operation:", operation);
      return {
        messages: [
          new AIMessage(
            "Sorry, I lost track of what we were doing. Please start your request again.",
          ),
        ],
        responseHandled: true,
        awaitingClarification: null,
      };
  }
}

/**
 * Handle swap days clarification
 */
async function handleSwapDaysClarification(
  userId: string,
  parsedDays: string[],
): Promise<Partial<PlanChatbotStateType>> {
  console.log("  🔄 Handling swap_days clarification with days:", parsedDays);

  if (parsedDays.length !== 2) {
    console.log("  ❌ Expected 2 days, got:", parsedDays.length);
    return {
      messages: [
        new AIMessage(
          `Please specify exactly two days to swap. You mentioned ${parsedDays.length} day(s).\n\nExample: "Monday and Tuesday"`,
        ),
      ],
      responseHandled: true,
      // Keep awaiting clarification
    };
  }

  // Process the swap operation
  const result = await processDayOperation(userId, {
    isEditRequest: true,
    isSafe: true,
    isRelevant: true,
    editType: "swap_days",
    extractedEdit: {
      day1: parsedDays[0],
      day2: parsedDays[1],
    },
  });

  if (!result.shouldConfirm) {
    console.log("  ❌ Swap validation failed:", result.errorMessage);
    return {
      messages: [new AIMessage(result.errorMessage)],
      responseHandled: true,
      awaitingClarification: null,
    };
  }

  console.log("  ✅ Swap validated, showing confirmation");
  return {
    waitingForConfirmation: true,
    pendingEdit: result.pendingEdit,
    messages: [new AIMessage(result.confirmMessage)],
    awaitingClarification: null,
  };
}

/**
 * Handle remove days clarification
 */
async function handleRemoveDaysClarification(
  userId: string,
  parsedDays: string[],
): Promise<Partial<PlanChatbotStateType>> {
  console.log("  🗑️ Handling remove_days clarification with days:", parsedDays);

  // Process the remove operation
  const result = await processDayOperation(userId, {
    isEditRequest: true,
    isSafe: true,
    isRelevant: true,
    editType: "remove_days",
    extractedEdit: {
      daysToRemove: parsedDays,
    },
  });

  if (!result.shouldConfirm) {
    console.log("  ❌ Remove validation failed:", result.errorMessage);
    return {
      messages: [new AIMessage(result.errorMessage)],
      responseHandled: true,
      awaitingClarification: null,
    };
  }

  console.log("  ✅ Remove validated, showing confirmation");
  return {
    waitingForConfirmation: true,
    pendingEdit: result.pendingEdit,
    messages: [new AIMessage(result.confirmMessage)],
    awaitingClarification: null,
  };
}

/**
 * Handle add_task clarification (when user provides time after vague request)
 */
async function handleAddTaskClarification(
  state: PlanChatbotStateType,
  userMessage: string,
): Promise<Partial<PlanChatbotStateType>> {
  console.log("  📝 Handling add_task clarification");
  const context = state.awaitingClarification?.context || {};
  const originalActivity = context.activity as string;
  const originalDay = context.day as string | undefined;
  const originalNotes = context.notes as string | undefined;

  console.log("  📦 Original context:", {
    originalActivity,
    originalDay,
    originalNotes,
  });

  // Parse day from user message directly
  const parsedDays = parseDayNames(userMessage);
  const day = parsedDays.length > 0 ? parsedDays[0] : originalDay;

  // Parse time range from user message directly
  const timeRange = parseTimeRange(userMessage);

  console.log("  📅 Extracted from clarification:", { day, timeRange });

  // Validate we have all required fields
  if (!day || !timeRange || timeRange === "vague") {
    console.log("  ❌ Still missing required fields");
    return {
      messages: [
        new AIMessage(
          `I still need ${!day ? "a day and " : ""}a specific time range. \n\n` +
            `Please provide in this format: "${!day ? "on Monday " : ""}from 7:00 AM to 8:00 AM"`,
        ),
      ],
      responseHandled: true,
      // Keep awaiting clarification
    };
  }

  // Validate the task data
  const { validateAddTask } = await import("../utils");
  const validation = await validateAddTask(
    state.userId,
    day,
    timeRange,
    originalActivity,
  );

  if (!validation.isValid) {
    console.log("  ❌ Validation failed:", validation.errors);
    return {
      mode: "query",
      messages: [
        new AIMessage(
          `**Cannot add this task.** ${validation.errors.join(" ")}\n\nPlease try again with valid information.`,
        ),
      ],
      responseHandled: true,
      awaitingClarification: null,
    };
  }

  const normalizedDay = validation.normalizedDay || day;

  // Check for similar activities
  const { checkSimilarActivities } = await import("../utils/validate-add-task");
  const similarCheck = await checkSimilarActivities(
    state.userId,
    normalizedDay,
    originalActivity,
  );

  if (similarCheck.hasSimilar && similarCheck.similarActivities) {
    console.log("  ℹ️ SIMILAR ACTIVITY FOUND - rejecting addition");
    const similarList = similarCheck.similarActivities
      .map((a) => `• **${a.activity}** at ${a.timeRange}`)
      .join("\n");

    return {
      mode: "query",
      messages: [
        new AIMessage(
          `I can't add **${originalActivity}** on **${normalizedDay}** because you already have a similar activity on that day:\n\n${similarList}\n\n` +
            `Please choose a different day or let me know if you'd like to replace the existing activity instead.`,
        ),
      ],
      responseHandled: true,
      awaitingClarification: null,
    };
  }

  // Check for time conflicts
  const conflictCheck = await checkTimeConflict(
    state.userId,
    normalizedDay,
    timeRange,
  );

  if (conflictCheck.hasConflict) {
    console.log("  ⚠️ TIME CONFLICT - offering overwrite option");
    return {
      waitingForConfirmation: true,
      pendingEdit: {
        type: "add_task",
        data: {
          day: normalizedDay,
          timeRange,
          activity: originalActivity,
          notes: originalNotes,
          conflictingActivity: conflictCheck.conflictingActivity,
          conflictingTime: conflictCheck.conflictingTime,
          shouldOverwrite: true,
        },
        description: `Overwrite ${conflictCheck.conflictingActivity} with ${originalActivity}`,
        preview: {
          before: `**${conflictCheck.conflictingActivity}**\n   ${normalizedDay} at ${conflictCheck.conflictingTime}`,
          after: `**${originalActivity}**\n   ${normalizedDay} at ${timeRange}${originalNotes ? `\n\nNotes:\n${originalNotes}` : ""}`,
          changes: [
            {
              field: "Activity",
              oldValue: conflictCheck.conflictingActivity || "",
              newValue: originalActivity,
            },
            {
              field: "Time",
              oldValue: conflictCheck.conflictingTime || "",
              newValue: timeRange,
            },
          ],
        },
      },
      messages: [
        new AIMessage(
          `⚠️ **Time Conflict Detected**\n\n` +
            `There's already a **${conflictCheck.conflictingActivity}** scheduled on **${normalizedDay}** at **${conflictCheck.conflictingTime}** that overlaps with your requested time (**${timeRange}**).\n\n` +
            `**Would you like me to overwrite it?**\n` +
            `- **Confirm**: Replace **${conflictCheck.conflictingActivity}** with **${originalActivity}**\n` +
            `- **Cancel**: Keep the existing activity and choose a different time\n\n[CONFIRM_BUTTON][CANCEL_BUTTON]`,
        ),
      ],
      awaitingClarification: null,
    };
  }

  // No conflicts - proceed with confirmation
  console.log("  ✅ No conflicts - showing confirmation");
  return {
    waitingForConfirmation: true,
    pendingEdit: {
      type: "add_task",
      data: {
        day: normalizedDay,
        timeRange,
        activity: originalActivity,
        notes: originalNotes,
      },
      description: `Add ${originalActivity}`,
      preview: {
        after: `**${originalActivity}**\n   ${normalizedDay} at ${timeRange}${originalNotes ? `\n\nNotes:\n${originalNotes}` : ""}`,
        changes: [
          { field: "Activity", newValue: originalActivity },
          { field: "Day", newValue: normalizedDay },
          { field: "Time", newValue: timeRange },
        ],
      },
    },
    messages: [
      new AIMessage(
        `✅ **Ready to add this activity**\n\n` +
          `**${originalActivity}**\n` +
          `${normalizedDay} at ${timeRange}${originalNotes ? `\n\nNotes:\n${originalNotes}` : ""}\n\n` +
          `[CONFIRM_BUTTON][CANCEL_BUTTON]`,
      ),
    ],
    awaitingClarification: null,
  };
}

/**
 * Parse day names from user message (simple version)
 */
function parseDayNames(message: string): string[] {
  const validDays = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const normalizedMessage = message.toLowerCase();
  const foundDays: string[] = [];

  for (const day of validDays) {
    if (normalizedMessage.includes(day)) {
      // Capitalize first letter
      foundDays.push(day.charAt(0).toUpperCase() + day.slice(1));
    }
  }

  return foundDays;
}

/**
 * Parse time range from user message
 * Supports formats like:
 * - "7:00 AM to 8:00 AM"
 * - "from 7:00 AM to 8:00 AM"
 * - "7:00 AM - 8:00 AM"
 * - "at 7:00 AM to 8:00 AM"
 */
function parseTimeRange(message: string): string | null {
  // Normalize the message
  const normalized = message.trim();

  // Pattern for time ranges with various separators
  // Matches: "7:00 AM to 8:00 AM", "7:00 AM - 8:00 AM", "07:00 to 08:00", etc.
  const timeRangePatterns = [
    // 12-hour format with AM/PM
    /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))\s*(?:to|-|until)\s*(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i,
    // 24-hour format
    /(\d{1,2}:\d{2})\s*(?:to|-|until)\s*(\d{1,2}:\d{2})/,
  ];

  for (const pattern of timeRangePatterns) {
    const match = normalized.match(pattern);
    if (match) {
      const startTime = match[1].trim();
      const endTime = match[2].trim();

      // Normalize AM/PM to uppercase
      const normalizedStart = startTime.replace(/am|pm/i, (m) =>
        m.toUpperCase(),
      );
      const normalizedEnd = endTime.replace(/am|pm/i, (m) => m.toUpperCase());

      return `${normalizedStart} - ${normalizedEnd}`;
    }
  }

  // If no time range found, return null
  return null;
}
