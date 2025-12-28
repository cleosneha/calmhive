import embeddings from "@/ai/config/embedding";
import qdrantClient, {
  QDRANT_COLLECTION_NAME,
  initQdrantCollection,
} from "@/ai/config/qdrant";
import { getPineconeIndex, initPineconeIndex } from "@/ai/config/pinecone";
import { ONBOARDING_QUESTIONS } from "@/onboarding/questions";

/**
 * Generate text representation of onboarding responses
 */
export function generateOnboardingText(
  responses: Record<string, string>
): string {
  const textParts: string[] = [];

  ONBOARDING_QUESTIONS.forEach((question) => {
    const answer = responses[question.key];
    if (answer) {
      textParts.push(`${question.text}\n${answer}`);
    }
  });

  return textParts.join("\n\n");
}

/**
 * Store onboarding data in both Qdrant and Pinecone
 */
export async function storeOnboardingEmbeddings(
  userId: string,
  responses: Record<string, string>
) {
  try {
    // Generate text from responses
    const onboardingText = generateOnboardingText(responses);

    // Generate embedding using Mistral
    const embedding = await embeddings.embedQuery(onboardingText);

    // Production: Pinecone only, Development: Qdrant only
    if (process.env.NODE_ENV === "production") {
      await storeInPinecone(userId, embedding, responses, onboardingText);
      console.log(
        `✓ Onboarding embeddings stored for user: ${userId} (Pinecone)`
      );
    } else {
      await storeInQdrant(userId, embedding, responses, onboardingText);
      console.log(
        `✓ Onboarding embeddings stored for user: ${userId} (Qdrant)`
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to store onboarding embeddings:", error);
    throw error;
  }
}

/**
 * Generate a numeric ID from a string (for Qdrant compatibility)
 */
function stringToNumericId(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Store embedding in Qdrant
 */
async function storeInQdrant(
  userId: string,
  embedding: number[],
  responses: Record<string, string>,
  text: string
) {
  try {
    // Ensure collection exists
    await initQdrantCollection();

    await qdrantClient.upsert(QDRANT_COLLECTION_NAME, {
      points: [
        {
          id: stringToNumericId(userId),
          vector: embedding,
          payload: {
            userId,
            responses,
            text,
            createdAt: new Date().toISOString(),
          },
        },
      ],
    });

    console.log(`✓ Stored in Qdrant for user: ${userId}`);
  } catch (error) {
    console.error("Qdrant storage error:", error);
    throw error;
  }
}

/**
 * Store embedding in Pinecone
 */
async function storeInPinecone(
  userId: string,
  embedding: number[],
  responses: Record<string, string>,
  text: string
) {
  try {
    // Ensure index exists
    await initPineconeIndex();

    const index = getPineconeIndex();

    await index.upsert([
      {
        id: userId,
        values: embedding,
        metadata: {
          userId,
          responses: JSON.stringify(responses),
          text,
          createdAt: new Date().toISOString(),
        },
      },
    ]);

    console.log(`✓ Stored in Pinecone for user: ${userId}`);
  } catch (error) {
    console.error("Pinecone storage error:", error);
    throw error;
  }
}

/**
 * Search similar onboarding profiles in Qdrant
 */
export async function searchSimilarProfilesQdrant(
  query: string,
  limit: number = 5
) {
  try {
    const queryEmbedding = await embeddings.embedQuery(query);

    const searchResult = await qdrantClient.search(QDRANT_COLLECTION_NAME, {
      vector: queryEmbedding,
      limit,
      with_payload: true,
    });

    return searchResult.map((result) => ({
      userId: result.payload?.userId as string,
      score: result.score,
      responses: result.payload?.responses as Record<string, string>,
    }));
  } catch (error) {
    console.error("Qdrant search error:", error);
    throw error;
  }
}

/**
 * Search similar onboarding profiles in Pinecone
 */
export async function searchSimilarProfilesPinecone(
  query: string,
  limit: number = 5
) {
  try {
    const queryEmbedding = await embeddings.embedQuery(query);
    const index = getPineconeIndex();

    const searchResult = await index.query({
      vector: queryEmbedding,
      topK: limit,
      includeMetadata: true,
    });

    return searchResult.matches.map((match) => ({
      userId: match.metadata?.userId as string,
      score: match.score || 0,
      responses: match.metadata?.responses
        ? JSON.parse(match.metadata.responses as string)
        : {},
    }));
  } catch (error) {
    console.error("Pinecone search error:", error);
    throw error;
  }
}

/**
 * Delete user's onboarding embeddings from vector stores
 */
export async function deleteOnboardingEmbeddings(userId: string) {
  try {
    // Production: Pinecone only, Development: Qdrant only
    if (process.env.NODE_ENV === "production") {
      const index = getPineconeIndex();
      await index.deleteOne(userId);
      console.log(`✓ Deleted embeddings for user: ${userId} (Pinecone)`);
    } else {
      await qdrantClient.delete(QDRANT_COLLECTION_NAME, {
        points: [stringToNumericId(userId)],
      });
      console.log(`✓ Deleted embeddings for user: ${userId} (Qdrant)`);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to delete embeddings:", error);
    throw error;
  }
}
