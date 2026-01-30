import { geminiModel, mistralModel } from "@/ai/config/llm";

/**
 * Single centralized place for all LLM invocations in plan chatbot
 * Uses Gemini as primary, Mistral as fallback on any error
 */
export async function invokeLLM(prompt: string): Promise<string> {
  try {
    console.log("🤖 Trying Gemini model...");
    const response = await geminiModel.invoke(prompt);
    return response.content.toString();
  } catch (geminiError) {
    console.warn("⚠️ Gemini failed, trying Mistral...", geminiError);
    try {
      console.log("🤖 Trying Mistral model...");
      const fallbackResponse = await mistralModel.invoke(prompt);
      console.log("✅ Used Mistral model for fallback");
      return fallbackResponse.content.toString();
    } catch (mistralError) {
      console.error("❌ Both models failed:", { geminiError, mistralError });
      throw new Error(
        `Both AI models failed. Gemini: ${geminiError instanceof Error ? geminiError.message : "Unknown error"}. Mistral: ${mistralError instanceof Error ? mistralError.message : "Unknown error"}`,
      );
    }
  }
}
