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
      const store = await vectorStore;

      // Search for existing user document using similarity search
      // Search by userId to find the user's plan document
      const searchQuery = `Weekly Plan ${session.user.id}`;
      const searchResults = await store.similaritySearch(searchQuery, 1);

      // If we found a user document, update it with all current tasks
      if (searchResults && searchResults.length > 0) {
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

          // Delete the old document using the stable point ID
          const isProd = process.env.NODE_ENV === "production";
          const pointId = generatePlanPointId(session.user.id);

          console.log("🔍 UPDATE ATTEMPT:");
          console.log("  isProd:", isProd);
          console.log("  userId:", session.user.id);
          console.log("  planId:", String(existingTask.planId));
          console.log("  Stable Point ID:", pointId);

          try {
            if (isProd) {
              console.log("📌 Using Pinecone deletion...");
              const pinecone = new (
                await import("@pinecone-database/pinecone")
              ).Pinecone({
                apiKey: process.env.PINECONE_API_KEY!,
              });
              const pineconeIndex = pinecone.Index(
                process.env.PINECONE_INDEX_NAME || "calmhive-embeddings"
              );

              // Query for vectors with matching userId metadata
              const queryResults = await pineconeIndex
                .namespace("plans")
                .query({
                  vector: new Array(1536).fill(0), // dummy vector for metadata query
                  filter: { userId: { $eq: session.user.id } },
                  topK: 100,
                  includeMetadata: true,
                });

              // Delete found vectors by their actual Pinecone IDs
              const vectorIdsToDelete = queryResults.matches.map((m) => m.id);
              if (vectorIdsToDelete.length > 0) {
                console.log(
                  "📍 Deleting Pinecone vectors by metadata (count):",
                  vectorIdsToDelete.length
                );
                await pineconeIndex
                  .namespace("plans")
                  .deleteMany(vectorIdsToDelete);
              }

              console.log(
                "✅ Deleted old plan documents from Pinecone for userId:",
                session.user.id
              );
            } else {
              console.log("📌 Using Qdrant deletion...");
              // Qdrant: delete by stable point ID
              const qdrantClient = (await import("@/ai/config/qdrant")).default;

              console.log("📍 Deleting Qdrant point ID:", pointId);

              const deleteResult = await qdrantClient.delete("calmhive", {
                points: [pointId],
              });

              console.log(
                "✅ Qdrant delete result:",
                JSON.stringify(deleteResult)
              );
              console.log(
                "✅ Deleted old plan document from Qdrant for userId:",
                session.user.id
              );
            }
          } catch (deleteError) {
            console.error(
              "❌ Delete operation failed with error:",
              deleteError
            );
            console.warn(
              "⚠️ Could not delete old document, will proceed with adding new one"
            );
          }

          console.log("📝 Now adding new document with same Point ID...");
          console.log("🔍 New document metadata:", {
            userId: session.user.id,
            planId: String(existingTask.planId),
            type: "plan",
          });

          // Add the updated document
          if (isProd) {
            // Pinecone: use native API to upsert with proper metadata
            const pinecone = new (
              await import("@pinecone-database/pinecone")
            ).Pinecone({
              apiKey: process.env.PINECONE_API_KEY!,
            });
            const pineconeIndex = pinecone.Index(
              process.env.PINECONE_INDEX_NAME || "calmhive-embeddings"
            );

            // Generate embeddings using LangChain
            const embeddingModel = (await import("@/ai/config/embedding"))
              .default;
            const vector = await embeddingModel.embedQuery(updatedContent);

            // Upsert with userId as filter for future queries
            await pineconeIndex.namespace("plans").upsert([
              {
                id: `user-${session.user.id}`, // Use consistent ID
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
              "✅ Document upserted in Pinecone with ID: user-" +
                session.user.id
            );
          } else {
            // Qdrant: add document with stable UUID v5
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
              "✅ Document updated in Qdrant with Point ID:",
              pointId
            );
          }

          console.log(
            "✅ User plan document updated in vector store for taskId:",
            updatedTask.id
          );
        }
      } else {
        console.warn(
          "⚠️ No existing user plan document found to update for userId:",
          session.user.id
        );
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
