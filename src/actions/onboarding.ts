"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import db from "@/lib/db";
import { HumanMessage, BaseMessage } from "@langchain/core/messages";
import {
  compileOnboardingGraph,
  createCheckpointer,
} from "@/ai/agents/onboarding";
import type { Prisma } from "@prisma/client";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";

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
  };
}

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

// Complete the onboarding and store responses in the database
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

  console.log(
    "🔍 Raw responses from state:",
    JSON.stringify(responses, null, 2)
  );

  // Get the current goal-specific question info from state
  const currentGoalQuestion =
    (state.values.currentGoalSpecificQuestion as string) || "";
  console.log("📋 Current goal specific question:", currentGoalQuestion);

  // Type for goal specific info structure that matches Prisma.InputJsonValue requirements
  interface GoalSpecificInfo {
    question: string;
    answer: string;
    [key: string]: string; // Index signature for Prisma compatibility
  }

  // Helper function to parse JSON safely
  function parseJSON<T>(value: unknown, fallback: T): T {
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        console.log("✅ Successfully parsed JSON string:", parsed);
        return parsed as T;
      } catch (error) {
        console.error("❌ Failed to parse JSON string:", value, error);
        return fallback;
      }
    }
    if (typeof value === "object" && value !== null) {
      console.log("📦 Value is already an object:", value);
      return value as T;
    }
    console.log("⚠️ Value is neither string nor object:", typeof value, value);
    return fallback;
  }

  // Helper function to get activities as string (not parsed)
  function parseActivities(value: unknown): string {
    console.log("🎯 Parsing activities from:", typeof value, value);

    if (!value) {
      console.log("⚠️ Activities value is empty/null/undefined");
      return "";
    }

    // If it's already a string, return as-is
    if (typeof value === "string") {
      console.log("✅ Activities stored as string:", value);
      return value;
    }

    // If it's an array or object (shouldn't happen but handle it)
    if (typeof value === "object") {
      const stringified = JSON.stringify(value);
      console.log("⚠️ Activities was an object, stringified:", stringified);
      return stringified;
    }

    return String(value);
  }

  // Helper function to find and parse goal specific info with proper typing
  function parseGoalSpecificInfo(
    responses: Record<string, unknown>,
    currentGoalQuestion: string
  ): Prisma.InputJsonValue {
    console.log("🎯 Parsing goalSpecificInfo - looking for dynamic question");

    // Look for the goalSpecificInfo key first (if it exists as JSON string)
    if (responses.goalSpecificInfo) {
      console.log("Found goalSpecificInfo key:", responses.goalSpecificInfo);
      const parsed = parseJSON<GoalSpecificInfo>(
        responses.goalSpecificInfo,
        {} as GoalSpecificInfo
      );
      if (
        parsed &&
        typeof parsed === "object" &&
        "question" in parsed &&
        "answer" in parsed
      ) {
        console.log(
          "✅ GoalSpecificInfo parsed from goalSpecificInfo key:",
          parsed
        );
        return parsed as Prisma.InputJsonValue;
      }
    }

    // If not found, look for the dynamic key (habitArea, stressAspect, sleepChallenge, etc.)
    // The pattern: after "goals" question, the next question's key contains the answer
    const questionKeys = Object.keys(responses);
    const goalsIndex = questionKeys.indexOf("goals");

    if (goalsIndex !== -1 && goalsIndex < questionKeys.length - 1) {
      // Get the next key after goals
      const nextKey = questionKeys[goalsIndex + 1];

      // Skip known system keys that are not goal-specific
      if (
        nextKey &&
        ![
          "timeAvailability",
          "activities",
          "energeticTime",
          "anythingElse",
          "readiness",
          "age",
        ].includes(nextKey)
      ) {
        const answer = responses[nextKey];

        // Find the question text from ONBOARDING_QUESTIONS by key
        const questionObj = ONBOARDING_QUESTIONS.find((q) => q.key === nextKey);
        const questionText = questionObj
          ? questionObj.text
          : currentGoalQuestion || `Question about ${nextKey}`;

        console.log(
          `✅ Found goal-specific answer in key "${nextKey}":`,
          answer
        );
        console.log(`📋 Question text from questions.ts:`, questionText);

        const result: GoalSpecificInfo = {
          question: questionText,
          answer: String(answer || ""),
        };

        console.log("✅ GoalSpecificInfo constructed:", result);
        return result as Prisma.InputJsonValue;
      }
    }

    console.log("⚠️ GoalSpecificInfo not found, returning empty object");
    return {} as Prisma.InputJsonValue;
  }

  // Map responses to Onboarding model fields with proper type safety
  const onboardingData = {
    age: responses.age ? parseInt(String(responses.age), 10) : 0,
    goals: String(responses.goals || ""),
    goalSpecificInfo: parseGoalSpecificInfo(responses, currentGoalQuestion),
    timeAvailability: (() => {
      const time = responses.timeAvailability
        ? parseInt(String(responses.timeAvailability), 10)
        : 0;
      return isNaN(time) ? 0 : time;
    })(),
    activities: parseActivities(responses.activities),
    energeticTime: String(responses.energeticTime || ""),
    additionalNotes: responses.additionalNotes
      ? String(responses.additionalNotes)
      : null,
    termsAccepted: true,
    completedAt: new Date(),
  };

  console.log(
    "💾 Final onboarding data to be stored:",
    JSON.stringify(onboardingData, null, 2)
  );

  // Validate critical fields before storing
  if (!onboardingData.goals) {
    console.error("❌ Missing goals field");
    throw new Error("Goals field is required");
  }

  if (!onboardingData.activities || onboardingData.activities.trim() === "") {
    console.warn("⚠️ No activities provided - this might be intentional");
  }

  if (Object.keys(onboardingData.goalSpecificInfo as object).length === 0) {
    console.warn(
      "⚠️ GoalSpecificInfo is empty - this might indicate the user skipped or the field wasn't captured"
    );
  }

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
  } catch (error) {
    console.error("Failed to clean checkpoint data (non-critical):", error);
    // Don't fail the onboarding if cleanup fails
  }

  return { success: true };
}

// Retrieve the current onboarding responses
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
