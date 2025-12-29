import { AIMessage } from "@langchain/core/messages";
import type { OnboardingStateType } from "./state";
import { ONBOARDING_QUESTIONS } from "@/onboarding/questions";
import { checkUserSafety } from "./tools/safety";

/**
 * Node: Greet User and Check Readiness
 * First node - greets the user and asks if they're ready
 */
export async function greetNode(state: OnboardingStateType) {
  // Only greet if no messages exist yet
  if (state.messages && state.messages.length > 0) {
    return {};
  }

  const greeting = `Hey ${state.userName}! Let's start understanding you for a better experience. 

You can tap an option (it will appear in the box) and edit it, or type your own.

Are you ready to start?`;

  return {
    messages: [new AIMessage(greeting)],
    step: 0,
  };
}

/**
 * Node: Reassurance for Not Ready Users
 * Shows supportive message when user is not ready
 */
export async function reassuranceNode(state: OnboardingStateType) {
  return {
    messages: [
      new AIMessage(
        "No pressure at all! Take your time. Please tell me 'ready to start' whenever you feel good to go. 🤍"
      ),
    ],
    step: 0, // Keep at step 0
  };
}

/**
 * Node: Ask Current Question
 * Presents the current question based on step
 */
export async function askQuestionNode(state: OnboardingStateType) {
  const questionIndex = state.step - 1;

  if (questionIndex < 0 || questionIndex >= ONBOARDING_QUESTIONS.length) {
    return {}; // Should not happen
  }

  const question = ONBOARDING_QUESTIONS[questionIndex];
  let prompt = question.text;

  if (!question.required) {
    prompt += "\n\n(This one is totally optional — you can skip.)";
  }

  return {
    messages: [new AIMessage(prompt)],
  };
}

/**
 * Node: Process User Response
 * Validates and processes user input, performs safety checks
 */
export async function processResponseNode(
  state: OnboardingStateType
): Promise<Partial<OnboardingStateType>> {
  const lastMessage = state.messages[state.messages.length - 1];
  const userInput =
    lastMessage &&
    "content" in lastMessage &&
    typeof lastMessage.content === "string"
      ? lastMessage.content.trim()
      : "";

  // Get current question
  const questionIndex = state.step - 1;
  const question =
    questionIndex >= 0 ? ONBOARDING_QUESTIONS[questionIndex] : null;

  // Skip safety checks for:
  // 1. Readiness responses (step 0)
  // 2. Predefined option selections
  const isReadinessResponse = state.step === 0;
  const isPredefinedOption =
    question &&
    question.options.some(
      (option) => option.toLowerCase() === userInput.toLowerCase()
    );
  const needsSafetyCheck = !isReadinessResponse && !isPredefinedOption;

  // Check if user is acknowledging safety message
  const isAcknowledgingSafety =
    state.waitingForSafetyAck && userInput.toLowerCase().includes("continue");

  if (isAcknowledgingSafety) {
    // Check if this was the last question
    const isLastQuestion = state.step === ONBOARDING_QUESTIONS.length;

    if (isLastQuestion) {
      // Clear safety flags and mark as complete
      return {
        waitingForSafetyAck: false,
        needsSafetyRedirect: false,
        step: state.step + 1,
        isComplete: true,
      };
    }

    // Not last question, proceed to next question
    return {
      waitingForSafetyAck: false,
      needsSafetyRedirect: false,
      step: state.step + 1,
    };
  }

  // Unified safety check (optimized: rule-based + minimal LLM usage)
  if (needsSafetyCheck) {
    const safetyResult = await checkUserSafety(userInput);
    if (safetyResult.isTriggered) {
      return {
        messages: [new AIMessage(safetyResult.message)],
        needsSafetyRedirect: true,
        waitingForSafetyAck: true,
      };
    }
  }

  // Handle readiness check (step 0)
  if (state.step === 0) {
    const lowerInput = userInput.toLowerCase();

    // Check for explicit "no" or "not ready" first
    const isNotReady =
      lowerInput.includes("no") ||
      lowerInput.includes("not ready") ||
      lowerInput.includes("not yet");

    // Check for "yes" or "ready to start"
    const isReady =
      (lowerInput.includes("yes") || lowerInput.includes("ready to start")) &&
      !isNotReady;

    if (isReady) {
      // User is ready, move to first question
      return {
        step: 1,
      };
    } else {
      // User not ready, flag for reassurance
      return {
        step: 0,
      };
    }
  }

  // Validate required questions
  if (question && question.required && !userInput) {
    return {
      messages: [
        new AIMessage(
          "I'd love to hear your thoughts on this. Could you share a bit more?"
        ),
      ],
      step: state.step, // Keep same step for re-asking
    };
  }

  // Store response
  if (question && userInput) {
    const newResponses = {
      [question.key]: userInput,
    };

    // Check if this is the last question
    const isLastQuestion = state.step === ONBOARDING_QUESTIONS.length;

    if (isLastQuestion) {
      return {
        responses: newResponses,
        step: state.step + 1,
        isComplete: true,
      };
    }

    return {
      responses: newResponses,
      step: state.step + 1,
    };
  }

  // Skip optional question
  if (question && !question.required && !userInput) {
    const isLastQuestion = state.step === ONBOARDING_QUESTIONS.length;

    if (isLastQuestion) {
      return {
        step: state.step + 1,
        isComplete: true,
      };
    }

    return {
      step: state.step + 1,
    };
  }

  // Default: keep same step
  return {
    step: state.step,
  };
}

/**
 * Node: Complete Onboarding
 * Final message before redirecting to T&C
 */
export async function completeNode(state: OnboardingStateType) {
  const message = `Thank you so much for sharing! That's all I need to create your personalized plan. 🤍

🎉 **Your responses have been saved!**

One last step: Please review and accept our Terms & Conditions to continue.

Click "Proceed to Terms & Conditions" below to continue.`;

  return {
    messages: [new AIMessage(message)],
  };
}
