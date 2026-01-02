"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import db from "@/lib/db";
import { HumanMessage, BaseMessage } from "@langchain/core/messages";
import {
  compileOnboardingGraph,
  createCheckpointer,
} from "@/ai/agents/onboarding";

let graphInstance: Awaited<ReturnType<typeof compileOnboardingGraph>> | null =
  null;

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
    firstName: (session.user.name || "there").split(" ")[0],
  };
}

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
  };
}

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
  };
}

export async function completeOnboarding() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  if (!graphInstance) graphInstance = await compileOnboardingGraph();

  const state = await graphInstance.getState({
    configurable: { thread_id: session.user.id },
  });

  if (!state?.values?.responses) {
    throw new Error("No onboarding session found");
  }

  const responses = state.values.responses as Record<string, unknown>;

  // Map responses to Onboarding model fields
  const onboardingData = {
    age: responses.age ? parseInt(responses.age as string) : 0,
    goals: (responses.goals as string) || "",
    goalSpecificInfo: responses.goalSpecificInfo || {},
    timeAvailability: responses.timeAvailability
      ? parseInt(responses.timeAvailability as string)
      : 0,
    activities: Array.isArray(responses.activities)
      ? (responses.activities as string[])
      : [],
    energeticTime: (responses.energeticTime as string) || "",
    additionalNotes: (responses.additionalNotes as string) || null,
    termsAccepted: true,
    completedAt: new Date(),
  };

  await db.onboarding.upsert({
    where: { userId: session.user.id },
    update: onboardingData,
    create: {
      userId: session.user.id,
      ...onboardingData,
    },
  });

  // Mark user as onboarded
  await db.user.update({
    where: { id: session.user.id },
    data: { onboarded: true },
  });

  // Update session's updatedAt to trigger cache refresh
  // Since cookie cache is disabled, next request will fetch fresh user data
  try {
    await db.session.update({
      where: { token: session.session.token },
      data: { updatedAt: new Date() },
    });

    console.log(`✓ Session updated for user: ${session.user.id}`);
  } catch (error) {
    console.error("Failed to update session (non-critical):", error);
  }

  // Embeddings storage disabled by configuration — removed
  // (Previously stored onboarding responses in Qdrant / Pinecone.)

  // Clean up checkpoint thread after onboarding completion
  try {
    const checkpointer = await createCheckpointer();
    await checkpointer.deleteThread(session.user.id);

    // Also manually clear all checkpoint tables for this user
    await db.$transaction([
      db.checkpoint.deleteMany({
        where: { threadId: session.user.id },
      }),
      db.checkpointBlob.deleteMany({
        where: { threadId: session.user.id },
      }),
      db.checkpointWrite.deleteMany({
        where: { threadId: session.user.id },
      }),
    ]);

    console.log(`✓ Cleaned all checkpoint data for user: ${session.user.id}`);
  } catch (error) {
    console.error("Failed to clean checkpoint data (non-critical):", error);
    // Don't fail the onboarding if cleanup fails
  }

  return { success: true };
}

export async function getOnboardingResponses() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const onboarding = await db.onboarding.findUnique({
    where: { userId: session.user.id },
  });

  if (!onboarding) {
    throw new Error("Onboarding data not found");
  }

  // Return as a responses object mapping
  return {
    responses: {
      age: onboarding.age?.toString() || "",
      goals: onboarding.goals,
      goalSpecificInfo: onboarding.goalSpecificInfo,
      timeAvailability: onboarding.timeAvailability?.toString() || "",
      activities: onboarding.activities,
      energeticTime: onboarding.energeticTime,
      additionalNotes: onboarding.additionalNotes || "",
    },
    completedAt: onboarding.completedAt,
  };
}
