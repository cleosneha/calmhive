import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { ToolResult, PendingEdit } from "../types";
import { MESSAGES } from "../utils";

/**
 * Tool to handle user confirmation (yes/confirm/ok)
 */
export const confirmEditTool = tool(
  async ({ pendingEdit }: { pendingEdit: string }): Promise<string> => {
    try {
      const edit: PendingEdit = JSON.parse(pendingEdit);

      return JSON.stringify({
        success: true,
        executeEdit: true,
        pendingEdit: edit,
        message: `Executing: ${edit.description}...`,
      } as ToolResult & { executeEdit: boolean });
    } catch {
      return JSON.stringify({
        success: false,
        message:
          "No pending edit to confirm. Please specify what changes you want to make.",
      } as ToolResult);
    }
  },
  {
    name: "confirm_edit",
    description: `Process user confirmation for a pending edit operation.

USE THIS TOOL WHEN:
- User says "yes", "confirm", "ok", "sure", "proceed", "do it", "go ahead"
- There is a pending edit that was shown to the user
- User clicked the confirm button (message contains "action:confirm")

This tool triggers the actual execution of the pending edit.

IMPORTANT: The pendingEdit parameter should be the JSON string of the pending edit object from the previous tool response.`,
    schema: z.object({
      pendingEdit: z
        .string()
        .describe("JSON string of the pending edit object"),
    }),
  },
);

/**
 * Tool to handle user cancellation (no/cancel/don't)
 */
export const cancelEditTool = tool(
  async (): Promise<string> => {
    return JSON.stringify({
      success: true,
      cancelled: true,
      message: MESSAGES.CONFIRMATION_CANCEL,
    } as ToolResult & { cancelled: boolean });
  },
  {
    name: "cancel_edit",
    description: `Process user cancellation of a pending edit operation.

USE THIS TOOL WHEN:
- User says "no", "cancel", "don't", "nope", "stop", "never mind"
- User clicked the cancel button (message contains "action:cancel")
- User wants to abort the pending operation

This tool clears the pending edit and returns a friendly cancellation message.`,
    schema: z.object({}),
  },
);
