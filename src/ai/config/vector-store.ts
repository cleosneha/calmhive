import { QdrantVectorStore } from "@langchain/qdrant";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import embeddings from "./embedding";

const isProd = process.env.NODE_ENV === "production";
const usePinecone = isProd || !!process.env.PINECONE_API_KEY;

const vectorStore = usePinecone
  ? (async () => {
      const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
      });

      const indexName = process.env.PINECONE_INDEX_NAME!;

      // Check if index exists
      const indexList = await pinecone.listIndexes();
      const indexExists = indexList.indexes?.some(
        (index) => index.name === indexName,
      );

      if (!indexExists) {
        console.warn(
          `⚠️ Pinecone index '${indexName}' does not exist. Vector store operations may fail.`,
        );
        // Return null or throw error - retrieval should handle this gracefully
        return null;
      }

      const pineconeIndex = pinecone.Index(indexName);

      return await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        maxConcurrency: 5,
        namespace: "plans",
      });
    })()
  : (async () => {
      try {
        // Try existing collection first
        return await QdrantVectorStore.fromExistingCollection(embeddings, {
          url: process.env.QDRANT_URL,
          collectionName: "calmhive",
        });
      } catch (error) {
        console.warn(
          "⚠️ Qdrant collection 'calmhive' does not exist. Vector store operations may fail.",
        );
        // Return null - retrieval should handle this gracefully
        return null;
      }
    })();

export default vectorStore;
