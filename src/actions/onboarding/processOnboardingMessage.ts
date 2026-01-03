"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { compileOnboardingGraph } from "@/ai/agents/onboarding";
import { HumanMessage, BaseMessage } from "@langchain/core/messages";

let graphInstance: Awaited<ReturnType<typeof compileOnboardingGraph>> | null =
  null;

// Process a user message through the onboarding graph
export async function processOnboardingMessage(userMessage: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  if (!graphInstance) graphInstance = await compileOnboardingGraph();

  const state = await graphInstance.getState({
    configurable: { thread_id: session.user.id },
  });

  if (!state?.values) throw new Error("SESSION_EXPIRED");

  const result = await graphInstance.invoke(
    { messages: [new HumanMessage(userMessage)] },
    { configurable: { thread_id: session.user.id } }
  );

  return {
    messages: result.messages.map((msg: BaseMessage) => ({
      role: msg._getType() === "ai" ? "assistant" : "user",
      content: msg.content,
    })),
    step: result.step,
    isComplete: result.isComplete,
    waitingForSafetyAck: result.waitingForSafetyAck,
    currentGoalOptions: result.currentGoalOptions || [],
    currentGoalSpecificQuestion: result.currentGoalSpecificQuestion || "",
  };
}
