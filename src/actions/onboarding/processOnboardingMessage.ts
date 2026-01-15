"use server";

import { getCurrentUser } from "@/actions/auth";
import { compileOnboardingGraph } from "@/ai/agents/onboarding";
import { HumanMessage, BaseMessage } from "@langchain/core/messages";
import { handleAIError } from "@/utils/ai-error-handler";
import type { ApiError } from "@/types/api";

let graphInstance: Awaited<ReturnType<typeof compileOnboardingGraph>> | null =
  null;

// Process a user message through the onboarding graph
export async function processOnboardingMessage(userMessage: string): Promise<
  | {
      messages: Array<{ role: string; content: string }>;
      step: number;
      isComplete: boolean;
      waitingForSafetyAck: boolean;
      currentGoalOptions: string[];
      currentGoalSpecificQuestion: string;
      selectedDays: string[];
      isMultiSelectMode: boolean;
    }
  | ApiError
> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    if (!graphInstance) graphInstance = await compileOnboardingGraph();

    const state = await graphInstance.getState({
      configurable: { thread_id: user.id },
    });

    if (!state?.values) throw new Error("SESSION_EXPIRED");

    const result = await graphInstance.invoke(
      { messages: [new HumanMessage(userMessage)] },
      { configurable: { thread_id: user.id } }
    );

    return {
      messages: result.messages.map((msg: BaseMessage) => ({
        role: msg._getType() === "ai" ? "assistant" : "user",
        content:
          typeof msg.content === "string"
            ? msg.content
            : Array.isArray(msg.content)
            ? msg.content.map((c) => ("text" in c ? c.text : "")).join("")
            : String(msg.content),
      })),
      step: result.step,
      isComplete: result.isComplete,
      waitingForSafetyAck: result.waitingForSafetyAck,
      currentGoalOptions: result.currentGoalOptions || [],
      currentGoalSpecificQuestion: result.currentGoalSpecificQuestion || "",
      selectedDays: result.selectedDays || [],
      isMultiSelectMode: result.isMultiSelectMode || false,
    };
  } catch (error) {
    console.error("❌ Error in onboarding message processing:", error);
    const { error: errorMessage, code, isRateLimit } = handleAIError(error);
    return {
      status: "error",
      error: errorMessage,
      code: isRateLimit ? "RATE_LIMIT_EXCEEDED" : code,
    };
  }
}
