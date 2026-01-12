"use server";

import { headers } from "next/headers";
import prisma from "@/lib/db";
import vectorStore from "@/ai/config/vector-store";
import { auth } from "@/lib/auth";
import { v5 as uuidv5 } from "uuid";

const PLAN_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

/**
 * Generate a deterministic UUID v5 for point ID based on userId
 */
function generatePlanPointId(userId: string): string {
  return uuidv5(`plan-${userId}`, PLAN_NAMESPACE);
}

// Type definitions with strict type safety
interface TaskUpdateInput {
  id: number;
  day: string;
  timeRange: string;
  activity: string;
  status: "pending" | "done" | "skipped" | "partial";
  notes: string | null;
  personalNotes?: string | null;
}

interface SaveEditResponse {
  success: boolean;
  message: string;
  data?: TaskUpdateInput;
}

/**
 * Parse time range string (e.g., "10:00-11:00") to minutes
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Check if two time ranges overlap
 */
function timeRangesOverlap(range1: string, range2: string): boolean {
  const [start1, end1] = range1.split("-").map(timeToMinutes);
  const [start2, end2] = range2.split("-").map(timeToMinutes);

  return start1 < end2 && start2 < end1;
}

/**
 * Validate that the new time range doesn't conflict with other tasks on the same day
 */
async function validateTimeRange(
  taskId: number,
  day: string,
  newTimeRange: string,
  planId: number
): Promise<string | null> {
  // Get all tasks for this day in the plan
  const tasksOnDay = await prisma.task.findMany({
    where: {
      planId,
      day,
      id: { not: taskId }, // Exclude the current task
    },
    select: {
      id: true,
      timeRange: true,
      activity: true,
    },
  });

  // Check for conflicts
  for (const task of tasksOnDay) {
    if (timeRangesOverlap(newTimeRange, task.timeRange)) {
      return `Time range conflict: "${newTimeRange}" overlaps with "${task.activity}" at ${task.timeRange}`;
    }
  }

  return null;
}

/**
 * Save task edits to database and update vector stores
 */
export async function saveTaskEdit(
  taskInput: TaskUpdateInput
): Promise<SaveEditResponse> {
  try {
    // Get current session
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized - Please log in",
      };
    }

    // Get the task with its plan info
    const existingTask = await prisma.task.findUnique({
      where: { id: taskInput.id },
      include: { plan: true },
    });

    if (!existingTask) {
      return {
        success: false,
        message: "Task not found",
      };
    }

    // Verify user owns this plan
    if (existingTask.plan.userId !== session.user.id) {
      return {
        success: false,
        message: "Unauthorized - You don't own this plan",
      };
    }

    // Validate time range if it has changed
    if (taskInput.timeRange !== existingTask.timeRange) {
      const conflictError = await validateTimeRange(
        taskInput.id,
        taskInput.day,
        taskInput.timeRange,
        existingTask.planId
      );

      if (conflictError) {
        return {
          success: false,
          message: conflictError,
        };
      }
    }

    // Also validate if day changed, check conflicts on the new day
    if (taskInput.day !== existingTask.day) {
      const conflictError = await validateTimeRange(
        taskInput.id,
        taskInput.day,
        taskInput.timeRange,
        existingTask.planId
      );

      if (conflictError) {
        return {
          success: false,
          message: conflictError,
        };
      }
    }

    // Update task in database
    const updatedTask = await prisma.task.update({
      where: { id: taskInput.id },
      data: {
        day: taskInput.day,
        timeRange: taskInput.timeRange,
        activity: taskInput.activity,
        status: taskInput.status,
        notes: taskInput.notes,
        personalNotes: taskInput.personalNotes || "",
      },
    });

    // Update vector stores (Pinecone for prod, Qdrant for dev)
    try {
      const isProd = process.env.NODE_ENV === "production";

      // Fetch all tasks for this plan to reconstruct the full document
      const allTasks = await prisma.task.findMany({
        where: { planId: existingTask.planId },
        select: {
          id: true,
          day: true,
          timeRange: true,
          activity: true,
          notes: true,
          personalNotes: true,
        },
      });

      // Get plan data for days off
      const plan = await prisma.plan.findUnique({
        where: { id: existingTask.planId },
        select: { daysOff: true },
      });

      if (allTasks.length > 0 && plan) {
        // Format updated plan content with all tasks including task IDs
        const tasksByDay: Record<string, typeof allTasks> = {};
        allTasks.forEach((task) => {
          if (!tasksByDay[task.day]) {
            tasksByDay[task.day] = [];
          }
          tasksByDay[task.day].push(task);
        });

        const days = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];

        const planDescription = days
          .filter((day) => tasksByDay[day])
          .map((day) => {
            const dayTasks = tasksByDay[day];
            const taskList = dayTasks
              .map(
                (task) =>
                  `[TaskID:${task.id}] ${task.timeRange}: ${task.activity}${
                    task.notes ? ` - ${task.notes}` : ""
                  }${
                    task.personalNotes
                      ? ` (Personal: ${task.personalNotes})`
                      : ""
                  }`
              )
              .join("; ");
            return `${day}: ${taskList}`;
          })
          .join(". ");

        const daysOffText =
          plan.daysOff.length > 0
            ? ` Days off: ${plan.daysOff.join(", ")}.`
            : "";

        const updatedContent = `Weekly Plan: ${planDescription}.${daysOffText}`;

        if (isProd) {
          // Pinecone: Query by userId, delete old if exists, then upsert new
          const pinecone = new (
            await import("@pinecone-database/pinecone")
          ).Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
          });
          const pineconeIndex = pinecone.Index(
            process.env.PINECONE_INDEX_NAME || "calmhive-embeddings"
          );

          console.log("🔍 Checking for existing plan document in Pinecone...");

          // Query for vectors with matching userId metadata
          try {
            const queryResults = await pineconeIndex.namespace("plans").query({
              vector: new Array(1536).fill(0), // dummy vector
              filter: { userId: { $eq: session.user.id } },
              topK: 100,
              includeMetadata: true,
            });

            // Delete found vectors by their actual Pinecone IDs
            const vectorIdsToDelete = queryResults.matches.map((m) => m.id);
            if (vectorIdsToDelete.length > 0) {
              console.log(
                "📍 Found existing documents, deleting count:",
                vectorIdsToDelete.length
              );
              await pineconeIndex
                .namespace("plans")
                .deleteMany(vectorIdsToDelete);
            }
          } catch (queryError) {
            console.warn("⚠️ Query for existing vectors failed:", queryError);
          }

          // Generate embeddings and upsert new document
          const embeddingModel = (await import("@/ai/config/embedding"))
            .default;
          const vector = await embeddingModel.embedQuery(updatedContent);

          console.log("📝 Upserting new plan document to Pinecone...");

          await pineconeIndex.namespace("plans").upsert([
            {
              id: `user-${session.user.id}`, // Consistent ID for this user
              values: vector,
              metadata: {
                userId: session.user.id,
                planId: String(existingTask.planId),
                type: "plan",
                updatedAt: new Date().toISOString(),
                text: updatedContent,
              },
            },
          ]);

          console.log(
            "✅ Plan document upserted in Pinecone for userId:",
            session.user.id
          );
        } else {
          // Qdrant: Use stable UUID and upsert
          const store = await vectorStore;
          const pointId = generatePlanPointId(session.user.id);

          console.log("📝 Upserting plan document to Qdrant...");

          await store.addDocuments(
            [
              {
                pageContent: updatedContent,
                metadata: {
                  userId: session.user.id,
                  planId: String(existingTask.planId),
                  type: "plan",
                  updatedAt: new Date().toISOString(),
                },
              },
            ],
            { ids: [pointId] }
          );

          console.log(
            "✅ Plan document upserted in Qdrant for userId:",
            session.user.id
          );
        }
      } else {
        console.warn("⚠️ No tasks found to embed");
      }
    } catch (vectorError) {
      // Log vector store error but don't fail the entire operation
      console.error("Vector store update failed:", vectorError);
      // Continue with success response since DB update succeeded
    }

    return {
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    };
  } catch (error) {
    console.error("Error saving task edit:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return {
      success: false,
      message: `Failed to save task: ${errorMessage}`,
    };
  }
}
