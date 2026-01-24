import { geminiModel, mistralModel } from "@/ai/config/llm";

/**
 * Single centralized place for all LLM invocations in plan chatbot
 * Uses Gemini as primary, Mistral as fallback on 429 errors
 */
export async function invokeLLM(prompt: string): Promise<string> {
  try {
    const response = await geminiModel.invoke(prompt);
    return response.content.toString();
  } catch (error: unknown) {
    console.error("Error invoking Gemini LLM:", error);

    // Check if it's a 429 error (rate limit)
    const isRateLimit =
      (typeof error === "object" &&
        error !== null &&
        "status" in error &&
        (error as { status: number }).status === 429) ||
      (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: number }).code === 429) ||
      (error instanceof Error && error.message?.includes("429"));

    if (isRateLimit) {
      console.log("Rate limit hit, falling back to Mistral");
      try {
        const fallbackResponse = await mistralModel.invoke(prompt);
        return fallbackResponse.content.toString();
      } catch (fallbackError) {
        console.error("Error invoking Mistral fallback:", fallbackError);
        throw fallbackError;
      }
    }

    // For other errors, throw the original error
    throw error;
  }
}
