"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { compileOnboardingGraph } from "@/ai/agents/onboarding";
import { BaseMessage } from "@langchain/core/messages";

let graphInstance: Awaited<ReturnType<typeof compileOnboardingGraph>> | null =
  null;

// Retrieve the current onboarding state without modifying it
export async function getOnboardingState() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  if (!graphInstance) graphInstance = await compileOnboardingGraph();

  const state = await graphInstance.getState({
    configurable: { thread_id: session.user.id },
  });

  if (!state?.values) return null;

  return {
    messages: state.values.messages.map((msg: BaseMessage) => ({
      role: msg._getType() === "ai" ? "assistant" : "user",
      content: msg.content,
    })),
    step: state.values.step,
    isComplete: state.values.isComplete,
    waitingForSafetyAck: state.values.waitingForSafetyAck,
    currentGoalOptions: state.values.currentGoalOptions || [],
    currentGoalSpecificQuestion: state.values.currentGoalSpecificQuestion || "",
  };
}
