"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { compileOnboardingGraph } from "@/ai/agents/onboarding";
import { BaseMessage } from "@langchain/core/messages";

let graphInstance: Awaited<ReturnType<typeof compileOnboardingGraph>> | null =
  null;

// Start a new onboarding session or resume existing one
export async function startOnboardingSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  if (!graphInstance) graphInstance = await compileOnboardingGraph();

  // Always invoke to get fresh or existing state
  const result = await graphInstance.invoke(
    { userId: session.user.id, userName: session.user.name || "there" },
    { configurable: { thread_id: session.user.id } }
  );

  // Map messages from graph
  const messages = result.messages.map((msg: BaseMessage) => ({
    role: msg._getType() === "ai" ? "assistant" : "user",
    content: msg.content,
  }));

  return {
    messages,
    step: result.step,
    isComplete: result.isComplete,
    waitingForSafetyAck: result.waitingForSafetyAck,
    currentGoalOptions: result.currentGoalOptions || [],
    currentGoalSpecificQuestion: result.currentGoalSpecificQuestion || "",
    firstName: (session.user.name || "there").split(" ")[0],
    selectedDays: result.selectedDays || [],
    isMultiSelectMode: result.isMultiSelectMode || false,
  };
}
