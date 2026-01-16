import { QdrantClient } from "@qdrant/js-client-rest";

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
  apiKey: process.env.QDRANT_API_KEY,
});

export const QDRANT_COLLECTION_NAME = "calmhive";

/**
 * Initialize Qdrant collection for CalmHive data (onboarding, plans, etc.)
 * Call this once during setup
 */
export async function initQdrantCollection() {
  try {
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.some(
      (col) => col.name === QDRANT_COLLECTION_NAME
    );

    if (!exists) {
      await qdrantClient.createCollection(QDRANT_COLLECTION_NAME, {
        vectors: {
          size: 1024, // Mistral-embed dimension
          distance: "Cosine",
        },
      });
    } else {
      console.log(
        "✅ Qdrant collection already exists:",
        QDRANT_COLLECTION_NAME
      );
    }
  } catch (error) {
    console.error("Failed to initialize Qdrant collection:", error);
    throw error;
  }
}

export default qdrantClient;
