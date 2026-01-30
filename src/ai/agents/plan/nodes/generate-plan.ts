import { geminiModel, mistralModel } from "@/ai/config/llm";
import type { PlanStateType } from "../state";
import { buildPlanGenerationPrompt } from "../utils/prompt-builder";
import { parseAIResponse } from "../utils/plan-formatter";
import { handleAIError } from "@/utils/ai-error-handler";

/**
 * Node: Generate plan using LLM
 * Uses the onboarding data to create a personalized weekly plan
 */
export async function generatePlanNode(
  state: PlanStateType,
): Promise<Partial<PlanStateType>> {
  try {
    const { onboardingData, retryCount, validationErrors } = state;

    if (!onboardingData) {
      return {
        error: "Onboarding data not available",
        isComplete: false,
      };
    }

    console.log(
      `🤖 Generating plan for user: ${onboardingData.userId} (Attempt ${retryCount + 1})`,
    );

    // Build prompt (with optional plan suggestions and validation errors for retry)
    const prompt = buildPlanGenerationPrompt(
      onboardingData,
      state.planSuggestions,
      validationErrors.length > 0 ? validationErrors : undefined,
    );

    // Try Gemini first, fallback to Mistral
    let response;
    let usedModel = "Gemini";

    try {
      console.log("🤖 Trying Gemini model...");
      response = await geminiModel.invoke(prompt);
    } catch (geminiError) {
      console.warn("⚠️ Gemini failed, trying Mistral...", geminiError);
      try {
        usedModel = "Mistral";
        console.log("🤖 Trying Mistral model...");
        response = await mistralModel.invoke(prompt);
      } catch (mistralError) {
        console.error("❌ Both models failed:", { geminiError, mistralError });
        const { error: errorMessage } = handleAIError(mistralError);
        return {
          error: `Both AI models failed: ${errorMessage}`,
          generatedTasks: [],
          isComplete: false,
        };
      }
    }

    console.log(`✅ Used ${usedModel} model for generation`);
    const content =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    console.log("📝 Raw LLM response:", content);

    // Parse response
    const tasks = parseAIResponse(content);

    console.log(`✅ Generated ${tasks.length} tasks`);

    return {
      generatedTasks: tasks,
      error: null,
    };
  } catch (error) {
    console.error("❌ Error generating plan:", error);
    const { error: errorMessage } = handleAIError(error);
    return {
      error: errorMessage,
      generatedTasks: [],
      isComplete: false,
    };
  }
}
