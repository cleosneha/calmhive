import model from "@/ai/config/llm";

/**
 * Single centralized place for all LLM invocations in plan chatbot
 */
export async function invokeLLM(prompt: string): Promise<string> {
  try {
    const llm = model;
    const response = await llm.invoke(prompt);
    return response.content.toString();
  } catch (error) {
    console.error("Error invoking LLM:", error);
    throw error;
  }
}
