import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";

/**
 * Initialize Gemini model (primary)
 */
export const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
  maxRetries: 2,
});

/**
 * Initialize Mistral model (fallback)
 */
export const mistralModel = new ChatMistralAI({
  model: "mistral-large-latest",
  apiKey: process.env.MISTRAL_API_KEY,
  maxRetries: 2,
});

/**
 * Invoke LLM with automatic fallback from Gemini to Mistral
 */
export async function invokeLLM(prompt: string): Promise<string> {
  try {
    console.log("🤖 [plan-chatbot-2] Trying Gemini model...");
    const response = await geminiModel.invoke(prompt);
    return response.content.toString();
  } catch (geminiError) {
    console.warn(
      "⚠️ [plan-chatbot-2] Gemini failed, trying Mistral...",
      geminiError,
    );
    try {
      console.log("🤖 [plan-chatbot-2] Trying Mistral model...");
      const fallbackResponse = await mistralModel.invoke(prompt);
      console.log("✅ [plan-chatbot-2] Used Mistral model for fallback");
      return fallbackResponse.content.toString();
    } catch (mistralError) {
      console.error("❌ [plan-chatbot-2] Both models failed:", {
        geminiError,
        mistralError,
      });
      throw new Error(
        `Both AI models failed. Gemini: ${geminiError instanceof Error ? geminiError.message : "Unknown error"}. Mistral: ${mistralError instanceof Error ? mistralError.message : "Unknown error"}`,
      );
    }
  }
}

/**
 * Get the primary model for agent usage
 * The fallback is handled via ModelFallbackMiddleware
 */
export function getPrimaryModel() {
  return geminiModel;
}

/**
 * Get the fallback model identifier for middleware
 */
export function getFallbackModelId(): string {
  return "mistral:mistral-large-latest";
}
