import llm from "@/ai/config/llm";

/**
 * Critical safety triggers (rule-based)
 * Checked immediately without LLM for fast detection
 */
const CRITICAL_SAFETY_KEYWORDS = [
  /suic/i,
  /kill myself/i,
  /self.?harm/i,
  /crisis/i,
  /end it all/i,
  /want to die/i,
  /harm myself/i,
];

/**
 * Health-related keywords requiring professional care
 */
const HEALTH_KEYWORDS =
  /\b(severe|chronic|diagnosed|medication|therapy|hospital|emergency|doctor|pain|disorder|disease)\b/i;

/**
 * Depression/anxiety keywords (less severe but need awareness)
 */
const MENTAL_HEALTH_KEYWORDS =
  /\b(depress|anxiety|panic attack|stress|overwhelm)\b/i;

/**
 * Safety messages for different severity levels
 */
const CRITICAL_SAFETY_MESSAGE = `I'm really sorry you're feeling this way. 

⚠️ **Important:** CalmHive is designed for gentle daily habits and relaxation. We strongly recommend that you seek guidance from a professional counselor, therapist, or doctor right away.

We can still help you create a personalized plan, but please consult with a healthcare professional first for proper support. 💚

If you'd like to continue with your onboarding, please respond with "continue" and I'll proceed with the next question.`;

const HEALTH_ISSUE_MESSAGE = `Thank you for sharing. 

⚠️ **Important:** It sounds like you may benefit from professional medical guidance. CalmHive is designed for light daily habits and relaxation, not for addressing medical conditions.

We strongly advise you to consult your doctor or healthcare provider to address these concerns properly.

We can still help you create a personalized wellness plan, but please seek professional medical support first. 🤍

If you'd like to continue with your onboarding, please respond with "continue" and I'll proceed with the next question.`;

const MENTAL_HEALTH_AWARENESS_MESSAGE = `Thank you for sharing. 

⚠️ **Please note:** While CalmHive can help with gentle daily habits and relaxation, if you're experiencing significant mental health challenges, we encourage you to also consult with a mental health professional for proper support.

We can still help you create a personalized wellness plan alongside professional care. 🤍

If you'd like to continue with your onboarding, please respond with "continue" and I'll proceed with the next question.`;

/**
 * Unified validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  isRelevant: boolean;
  hasSafetyIssue: boolean;
  safetyMessage?: string;
  followUpText?: string;
  errorMessage?: string;
}

/**
 * Unified validation tool: Performs all checks in optimal order
 * 1. Rule-based safety (instant, no LLM)
 * 2. Spam/gibberish detection (regex, no LLM)
 * 3. LLM unified check (relevance + advanced safety + follow-up)
 */
export async function validateUserResponse(
  userResponse: string,
  currentQuestionText: string,
  nextQuestionText: string
): Promise<ValidationResult> {
  const trimmedResponse = userResponse.trim();
  const wordCount = trimmedResponse.split(/\s+/).length;

  // ===== STEP 1: Rule-based safety check (critical keywords) =====
  const hasCriticalKeyword = CRITICAL_SAFETY_KEYWORDS.some((trigger) =>
    trigger.test(trimmedResponse)
  );

  if (hasCriticalKeyword) {
    return {
      isValid: false,
      isRelevant: true,
      hasSafetyIssue: true,
      safetyMessage: CRITICAL_SAFETY_MESSAGE,
    };
  }

  // ===== STEP 2: Health keywords check (less severe) =====
  const hasHealthKeyword = HEALTH_KEYWORDS.test(trimmedResponse);

  if (hasHealthKeyword) {
    return {
      isValid: false,
      isRelevant: true,
      hasSafetyIssue: true,
      safetyMessage: HEALTH_ISSUE_MESSAGE,
    };
  }

  // ===== STEP 3: Mental health keywords (awareness level) =====
  const hasMentalHealthKeyword = MENTAL_HEALTH_KEYWORDS.test(trimmedResponse);

  if (hasMentalHealthKeyword) {
    return {
      isValid: false,
      isRelevant: true,
      hasSafetyIssue: true,
      safetyMessage: MENTAL_HEALTH_AWARENESS_MESSAGE,
    };
  }

  // ===== STEP 6: LLM unified validation (relevance + advanced safety + follow-up) =====
  try {
    const prompt = `You are an onboarding assistant for CalmHive, a mental wellness app. Analyze this user response and provide a structured evaluation.

Current Question: "${currentQuestionText}"
User Response: "${trimmedResponse}"
Next Question: "${nextQuestionText}"

Evaluate the response and respond in this EXACT format:

RELEVANCE: [yes/no]
SAFETY: [safe/concern]
FOLLOW_UP: [your warm acknowledgment (1-2 sentences) + next question]

Guidelines:
1. RELEVANCE: Check if the user's response is actually answering the current question asked. Mark "yes" if they're answering the question about goals, time availability, activities, or energy levels. Mark "no" only if it's completely off-topic (spam, gibberish, unrelated topics like "pizza", "random words", etc). Mental health or wellness topics are ALWAYS relevant.

2. SAFETY: "concern" ONLY if mentions extreme crisis situations not already caught (self-harm intent, suicidal thoughts, severe trauma). For general stress, anxiety, or wellness goals, mark as "safe" since CalmHive is a wellness app.

3. FOLLOW_UP: Only provide if RELEVANCE=yes AND SAFETY=safe. Warmly acknowledge their response and ask the next question naturally. Be empathetic and conversational.`;

    const response = await llm.invoke(prompt);

    const content =
      typeof response.content === "string" ? response.content.trim() : "";

    // Parse structured response
    const relevanceMatch = content.match(/RELEVANCE:\s*(yes|no)/i);
    const safetyMatch = content.match(/SAFETY:\s*(safe|concern)/i);
    const followUpMatch = content.match(/FOLLOW_UP:\s*(.+)/i);

    const isRelevant = relevanceMatch?.[1]?.toLowerCase() === "yes";
    const hasSafetyIssue = safetyMatch?.[1]?.toLowerCase() === "concern";
    const followUpText = followUpMatch?.[1]?.trim();

    // Handle irrelevant response
    if (!isRelevant) {
      return {
        isValid: false,
        isRelevant: false,
        hasSafetyIssue: false,
        errorMessage:
          "That answer seems to be irrelevant to the question asked. Could you please provide a relevant response to the previously asked question?",
      };
    }

    // Handle LLM-detected safety issue (extreme cases not caught by rules)
    if (hasSafetyIssue) {
      return {
        isValid: false,
        isRelevant: true,
        hasSafetyIssue: true,
        safetyMessage: CRITICAL_SAFETY_MESSAGE,
      };
    }

    // Valid response - return follow-up
    return {
      isValid: true,
      isRelevant: true,
      hasSafetyIssue: false,
      followUpText:
        followUpText || `Thank you for sharing. ${nextQuestionText}`,
    };
  } catch (error) {
    console.error("Error in unified validation:", error);
    // Fallback: assume valid and generate simple follow-up
    return {
      isValid: true,
      isRelevant: true,
      hasSafetyIssue: false,
      followUpText: `Thank you for sharing. ${nextQuestionText}`,
    };
  }
}
