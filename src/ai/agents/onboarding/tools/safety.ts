import llm from "@/ai/config/llm";

/**
 * Critical safety triggers (rule-based)
 * These are handled immediately without LLM intervention
 */
const CRITICAL_TRIGGERS = [
  /suic/i,
  /kill myself/i,
  /self.?harm/i,
  /crisis/i,
  /end it all/i,
  /want to die/i,
  /depress/i,
  /anxiety/i,
  /panic attack/i,
];

const CRITICAL_SAFETY_MESSAGE = `I'm really sorry you're feeling this way. 

⚠️ **Important:** CalmHive is designed for gentle daily habits and relaxation. We strongly recommend that you seek guidance from a professional counselor, therapist, or doctor right away.

We can still help you create a personalized plan, but please consult with a healthcare professional first for proper support. 💚

If you'd like to continue with your onboarding, please respond with "continue" and I'll proceed with the next question.`;

const HEALTH_ISSUE_MESSAGE = `Thank you for sharing. 

⚠️ **Important:** It sounds like you may benefit from professional medical guidance. CalmHive is designed for light daily habits and relaxation, not for addressing medical conditions.

We strongly advise you to consult your doctor or healthcare provider to address these concerns properly.

We can still help you create a personalized wellness plan, but please seek professional medical support first. 🤍

If you'd like to continue with your onboarding, please respond with "continue" and I'll proceed with the next question.`;

/**
 * Unified safety check: Detects concerning responses with minimal LLM usage
 * 1. Rule-based check (fast, no LLM)
 * 2. LLM check only for ambiguous cases (optimized)
 */
export async function checkUserSafety(input: string): Promise<{
  isTriggered: boolean;
  message: string;
}> {
  // Step 1: Rule-based check (instant, no cost)
  const hasKeyword = CRITICAL_TRIGGERS.some((trigger) => trigger.test(input));

  if (hasKeyword) {
    return {
      isTriggered: true,
      message: CRITICAL_SAFETY_MESSAGE,
    };
  }

  // Step 2: Quick heuristics to skip LLM for obviously safe inputs
  const wordCount = input.trim().split(/\s+/).length;
  const isTooShort = wordCount < 3; // "yes", "no", "skip" etc.
  const isSimpleAnswer =
    wordCount < 5 && !/\b(pain|hurt|sick|ill|disease|disorder)\b/i.test(input);

  if (isTooShort || isSimpleAnswer) {
    return { isTriggered: false, message: "" };
  }

  // Step 3: LLM check for complex/ambiguous responses (minimal usage)
  try {
    const response = await llm.invoke(
      `Does this mention severe health/mental issues requiring medical care? Answer ONLY "yes" or "no":\n"${input}"`
    );

    const content =
      typeof response.content === "string"
        ? response.content.toLowerCase().trim()
        : "";

    const isTriggered = content.includes("yes");

    return {
      isTriggered,
      message: isTriggered ? HEALTH_ISSUE_MESSAGE : "",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(errorMessage);
    if (errorMessage.includes("quota") || errorMessage.includes("429")) {
      console.error("⚠️ LLM quota exhausted. Using rule-based safety only.");
    } else {
      console.error("Safety check error:", errorMessage);
    }

    // Fallback: no trigger if LLM fails
    return { isTriggered: false, message: "" };
  }
}
