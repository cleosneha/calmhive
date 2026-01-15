"use server";

import embeddings from "@/ai/config/embedding";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Pinecone } from "@pinecone-database/pinecone";
import type { PlanTask } from "@/ai/agents/plan/types";
import type { Task } from "@prisma/client";
import { v5 as uuidv5 } from "uuid";

const isProd = process.env.NODE_ENV === "production";
const PLAN_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"; // Standard UUID v5 namespace for plans

/**
 * Generate a deterministic UUID v5 for point ID based on userId
 * This produces a valid UUID compatible with Qdrant's requirements
 */
function generatePlanPointId(userId: string): string {
  return uuidv5(`plan-${userId}`, PLAN_NAMESPACE);
}

/**
 * Embed plan data in vector store (Qdrant for local, Pinecone for prod)
 * Accepts both PlanTask (from LLM) and Task (from DB with IDs)
 */
export async function embedPlan(
  userId: string,
  planId: number,
  tasks: PlanTask[] | Task[],
  daysOff: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Format plan data for embedding
    const planText = formatPlanForEmbedding(tasks, daysOff);

    const metadata = {
      userId,
      planId: planId.toString(),
      type: "plan",
      createdAt: new Date().toISOString(),
    };

    if (isProd) {
      // Pinecone for production
      const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
      });

      const pineconeIndex = pinecone.Index(
        process.env.PINECONE_INDEX_NAME || "calmhive-embeddings"
      );

      // Generate embedding
      const vector = await embeddings.embedQuery(planText);

      // Use consistent ID format: user-${userId}
      const documentId = `user-${userId}`;

      // Upsert with explicit ID
      await pineconeIndex.namespace("plans").upsert([
        {
          id: documentId,
          values: vector,
          metadata: {
            ...metadata,
            text: planText,
          },
        },
      ]);

      console.log(
        "✅ Plan embedded in Pinecone with ID:",
        documentId,
        "planId:",
        planId
      );
    } else {
      // Qdrant for local development
      const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
          url: process.env.QDRANT_URL || "http://localhost:6333",
          collectionName: "calmhive",
        }
      );

      // Use the userId as the point ID
      const pointId = generatePlanPointId(userId);

      await vectorStore.addDocuments(
        [
          {
            pageContent: planText,
            metadata,
          },
        ],
        {
          ids: [pointId],
        }
      );

      console.log("✅ Plan embedded in Qdrant:", planId);
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Error embedding plan:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to embed plan",
    };
  }
}

/**
 * Delete plan embeddings from vector store
 */
export async function deletePlanEmbedding(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (isProd) {
      // Pinecone for production
      const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
      });

      const pineconeIndex = pinecone.Index(
        process.env.PINECONE_INDEX_NAME || "calmhive-embeddings"
      );

      const documentId = `user-${userId}`;
      await pineconeIndex.namespace("plans").deleteOne(documentId);

      console.log("✅ Plan embedding deleted from Pinecone (id):", documentId);
    } else {
      // Qdrant for local development
      const qdrantClient = (await import("@/ai/config/qdrant")).default;

      // Use userId as the point ID
      const pointId = generatePlanPointId(userId);

      await qdrantClient.delete("calmhive", {
        points: [pointId],
      });

      console.log(
        "✅ Plan embedding deleted from Qdrant (pointId = userId):",
        userId
      );
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Error deleting plan embedding:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete plan embedding",
    };
  }
}

/**
 * Format plan tasks for embedding
 * Handles both DB tasks (with IDs) and LLM tasks (without IDs)
 */
function formatPlanForEmbedding(
  tasks: PlanTask[] | Task[],
  daysOff: string[]
): string {
  const tasksByDay: Record<string, (PlanTask | Task)[]> = {};

  tasks.forEach((task) => {
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
        .map((task) => {
          // Check if task has ID (DB task) or not (LLM task)
          const hasId = "id" in task && typeof task.id === "number";
          const taskIdPrefix = hasId ? `[TaskID:${(task as Task).id}] ` : "";
          const notes = "notes" in task && task.notes ? ` - ${task.notes}` : "";
          const personalNotes =
            "personalNotes" in task && task.personalNotes
              ? ` (Personal: ${task.personalNotes})`
              : "";
          return `${taskIdPrefix}${task.timeRange}: ${task.activity}${notes}${personalNotes}`;
        })
        .join("; ");
      return `${day}: ${taskList}`;
    })
    .join(". ");

  const daysOffText =
    daysOff.length > 0 ? ` Days off: ${daysOff.join(", ")}.` : "";

  return `Weekly Plan: ${planDescription}.${daysOffText}`;
}
