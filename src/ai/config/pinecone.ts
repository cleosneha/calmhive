import { Pinecone } from "@pinecone-database/pinecone";

const pineconeClient = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "",
});

export const PINECONE_INDEX_NAME = "calmhive-onboarding";

/**
 * Initialize Pinecone index for onboarding data
 * Call this once during setup
 */
export async function initPineconeIndex() {
  try {
    const indexes = await pineconeClient.listIndexes();
    const exists = indexes.indexes?.some(
      (idx) => idx.name === PINECONE_INDEX_NAME
    );

    if (!exists) {
      await pineconeClient.createIndex({
        name: PINECONE_INDEX_NAME,
        dimension: 1024, // Mistral-embed dimension
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
      });
      console.log(`✓ Pinecone index "${PINECONE_INDEX_NAME}" created`);
    }
  } catch (error) {
    console.error("Failed to initialize Pinecone index:", error);
    throw error;
  }
}

/**
 * Get Pinecone index instance
 */
export function getPineconeIndex() {
  return pineconeClient.index(PINECONE_INDEX_NAME);
}

export default pineconeClient;
