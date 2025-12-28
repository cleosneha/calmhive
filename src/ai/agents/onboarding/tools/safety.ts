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
];

const CRITICAL_SAFETY_MESSAGE = `I'm really sorry you're feeling this way. CalmHive is only designed to support gentle daily habits and relaxation.
Please reach out to a trusted friend, family member, or professional counselor/doctor right away.
You can continue onboarding whenever you're ready, or come back later.`;

const SEVERE_HEALTH_MESSAGE = `Thank you for sharing. It sounds like you may benefit from professional medical guidance.
CalmHive is designed for light daily habits and relaxation, not medical conditions.
Please consult your doctor or healthcare provider to address these concerns.
We're here to support your wellness journey once you've checked in with a professional. 💚`;

/**
 * Tool: Check for critical distress keywords (rule-based)
 */
export function checkCriticalSafety(input: string): {
  isTriggered: boolean;
  message: string;
} {
  const triggered = CRITICAL_TRIGGERS.some((trigger) => trigger.test(input));

  return {
    isTriggered: triggered,
    message: CRITICAL_SAFETY_MESSAGE,
  };
}

/**
 * Tool: Check for severe health issues using LLM classification
 */
export async function checkSevereHealth(input: string): Promise<{
  isTriggered: boolean;
  message: string;
}> {
  try {
    const prompt = `Classify if this user input mentions severe health issues (mental or physical conditions requiring medical attention):
"${input}"

Only respond with JSON: { "hasSevereIssue": true/false, "type": "mental"/"physical"/"emergency"/"none" }`;

    // Add timeout to prevent long waits
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("LLM timeout")), 5000);
    });

    const response = await Promise.race([llm.invoke(prompt), timeoutPromise]);
    const content =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { isTriggered: false, message: "" };
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      isTriggered: result.hasSevereIssue === true,
      message: SEVERE_HEALTH_MESSAGE,
    };
  } catch (error) {
    console.error("Failed to check severe health:", error);
    // Gracefully continue without safety check if LLM fails
    return { isTriggered: false, message: "" };
  }
}
