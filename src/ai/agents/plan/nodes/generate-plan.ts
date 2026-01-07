import model from "@/ai/config/llm";
import type { PlanStateType } from "../state";
import { buildPlanGenerationPrompt } from "../utils/prompt-builder";
import { parseAIResponse } from "../utils/plan-formatter";

/**
 * Node: Generate plan using LLM
 * Uses the onboarding data to create a personalized weekly plan
 */
export async function generatePlanNode(
  state: PlanStateType
): Promise<Partial<PlanStateType>> {
  try {
    const { onboardingData } = state;

    if (!onboardingData) {
      return {
        error: "Onboarding data not available",
        isComplete: false,
      };
    }

    console.log("🤖 Generating plan for user:", onboardingData.userId);

    // Build prompt
    const prompt = buildPlanGenerationPrompt(onboardingData);

    // Call LLM
    const response = await model.invoke(prompt);
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
    return {
      error: error instanceof Error ? error.message : "Failed to generate plan",
      generatedTasks: [],
      isComplete: false,
    };
  }
}
