"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import db from "@/lib/db";
import { createCheckpointer } from "@/ai/agents/onboarding";
import type { Prisma } from "@prisma/client";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";
import { compileOnboardingGraph } from "@/ai/agents/onboarding";
let graphInstance: Awaited<ReturnType<typeof compileOnboardingGraph>> | null =
  null;

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

  // Get the current goal-specific question info from state
  const currentGoalQuestion =
    (state.values.currentGoalSpecificQuestion as string) || "";

  interface GoalSpecificInfo {
    question: string;
    answer: string;
    [key: string]: string;
  }

  function parseJSON<T>(value: unknown, fallback: T): T {
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return parsed as T;
      } catch {
        return fallback;
      }
    }
    if (typeof value === "object" && value !== null) {
      return value as T;
    }
    return fallback;
  }

  function parseActivities(value: unknown): string {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  }

  function parseDaysOff(value: unknown): string[] {
    if (!value) return [];
    if (typeof value === "string") {
      // Handle comma-separated string like "Monday, Tuesday, Wednesday"
      const days = value.split(",").map((d) => d.trim());
      // Filter out "None" if it exists
      return days.filter((d) => d && d !== "None");
    }
    if (Array.isArray(value)) {
      // Filter out "None" if it exists
      return value.filter((d) => typeof d === "string" && d !== "None");
    }
    return [];
  }

  function parseGoalSpecificInfo(
    responses: Record<string, unknown>,
    currentGoalQuestion: string
  ): Prisma.InputJsonValue {
    if (responses.goalSpecificInfo) {
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
        return parsed as Prisma.InputJsonValue;
      }
    }
    const questionKeys = Object.keys(responses);
    const goalsIndex = questionKeys.indexOf("goals");
    if (goalsIndex !== -1 && goalsIndex < questionKeys.length - 1) {
      const nextKey = questionKeys[goalsIndex + 1];
      if (
        nextKey &&
        ![
          "timeAvailability",
          "activities",
          "energeticTime",
          "daysOff",
          "anythingElse",
          "readiness",
          "age",
        ].includes(nextKey)
      ) {
        const answer = responses[nextKey];
        const questionObj = ONBOARDING_QUESTIONS.find((q) => q.key === nextKey);
        const questionText = questionObj
          ? questionObj.text
          : currentGoalQuestion || `Question about ${nextKey}`;
        const result: GoalSpecificInfo = {
          question: questionText,
          answer: String(answer || ""),
        };
        return result as Prisma.InputJsonValue;
      }
    }
    return {} as Prisma.InputJsonValue;
  }

  const parsedDaysOff = parseDaysOff(responses.daysOff);

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
    // daysOff will be applied explicitly in update/create using proper Prisma array syntax
    additionalNotes: responses.additionalNotes
      ? String(responses.additionalNotes)
      : null,
    termsAccepted: true,
    completedAt: new Date(),
  };

  if (!onboardingData.goals) {
    throw new Error("Goals field is required");
  }

  await db.onboarding.upsert({
    where: { userId: session.user.id },
    update: {
      ...onboardingData,
      // For list fields, Prisma expects the set syntax on update
      daysOff: { set: parsedDaysOff },
    },
    create: {
      userId: session.user.id,
      ...onboardingData,
      // For create, we can directly pass the array
      daysOff: parsedDaysOff,
    },
  });

  await db.user.update({
    where: { id: session.user.id },
    data: { onboarded: true },
  });

  try {
    await db.session.update({
      where: { token: session.session.token },
      data: { updatedAt: new Date() },
    });
  } catch {}

  try {
    const checkpointer = await createCheckpointer();
    await checkpointer.deleteThread(session.user.id);
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
  } catch {}

  return { success: true };
}
