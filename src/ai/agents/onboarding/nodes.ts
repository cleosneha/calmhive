import { AIMessage } from "@langchain/core/messages";
import type { OnboardingStateType } from "./state";
import { ONBOARDING_QUESTIONS } from "@/onboarding/questions";
import { validateUserResponse } from "./tools/validation";

/**
 * Node: Greet User and Check Readiness
 * First node - greets the user and asks if they're ready
 */
export async function greetNode(state: OnboardingStateType) {
  // Only greet if no messages exist yet
  if (state.messages && state.messages.length > 0) {
    return {};
  }

  // Extract first name from full name
  const firstName = state.userName.split(" ")[0];

  const greeting = `Hey ${firstName}! Let's start understanding you for a better experience. 

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function reassuranceNode(_state: OnboardingStateType) {
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
 * If there's a previous response, use the follow-up acknowledgment
 */
export async function askQuestionNode(state: OnboardingStateType) {
  const questionIndex = state.step - 1;

  if (questionIndex < 0 || questionIndex >= ONBOARDING_QUESTIONS.length) {
    return {}; // Should not happen
  }

  const question = ONBOARDING_QUESTIONS[questionIndex];
  let prompt = "";

  // Check if we have a previous response and a matching follow-up
  if (state.lastUserResponse && questionIndex > 0) {
    const previousQuestion = ONBOARDING_QUESTIONS[questionIndex - 1];

    // Check if the previous response matches a predefined option
    if (previousQuestion.followUps) {
      const followUp = previousQuestion.followUps[state.lastUserResponse];

      if (followUp && followUp.nextKey === question.key) {
        // Use the predefined follow-up text (includes acknowledgment + question)
        prompt = followUp.text;
      } else {
        // Custom response - use the generated follow-up from state if available
        // Otherwise just use the question text
        prompt = question.text;
      }
    } else {
      prompt = question.text;
    }
  } else {
    // First question or no previous response
    prompt = question.text;
  }

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

  // Skip validation for:
  // 1. Predefined option selections
  // 2. Empty responses (skip)
  // 3. User explicitly wants to skip
  const isPredefinedOption =
    question &&
    question.options.some(
      (option) => option.toLowerCase() === userInput.toLowerCase()
    );

  // Check if user wants to skip (for optional questions)
  const isSkipIntent =
    question &&
    userInput.length > 0 &&
    (userInput.toLowerCase().includes("skip") ||
      userInput.toLowerCase().includes("pass") ||
      userInput.toLowerCase() === "no" ||
      userInput.toLowerCase() === "nope");

  // If user tries to skip a required question, show polite message
  if (isSkipIntent && question?.required) {
    return {
      messages: [
        new AIMessage(
          "I understand you might want to skip, but I'd really appreciate your thoughts on this question. It helps me understand you better. Could you please share your response?"
        ),
      ],
      step: state.step, // Keep same step
    };
  }

  // Handle skip intent for optional questions
  if (isSkipIntent) {
    const isLastQuestion = state.step === ONBOARDING_QUESTIONS.length;

    if (isLastQuestion) {
      // Last question skipped - show acknowledgment
      return {
        step: state.step,
        lastQuestionAcknowledged: true,
        messages: [
          new AIMessage(
            "No worries at all! You've already shared so much valuable information. 🤍"
          ),
        ],
      };
    }

    // Not last question - skip to next
    return {
      step: state.step + 1,
    };
  }

  // For custom responses, use unified validation (single comprehensive check)
  if (!isPredefinedOption && userInput.length > 0 && question) {
    const isLastQuestion = state.step === ONBOARDING_QUESTIONS.length;

    // For last question, generate acknowledgment instead of next question
    const nextQuestionText = isLastQuestion
      ? "Acknowledge their response warmly and thank them for sharing."
      : ONBOARDING_QUESTIONS[state.step]?.text || "";

    if (nextQuestionText) {
      // Single unified validation: rule-based safety + LLM (relevance + follow-up)
      const validationResult = await validateUserResponse(
        userInput,
        question.text,
        nextQuestionText
      );

      // Handle safety issue (detected by rules or LLM)
      if (validationResult.hasSafetyIssue) {
        return {
          messages: [new AIMessage(validationResult.safetyMessage || "")],
          needsSafetyRedirect: true,
          waitingForSafetyAck: true,
        };
      }

      // Handle irrelevant response
      if (!validationResult.isRelevant) {
        return {
          messages: [new AIMessage(validationResult.errorMessage || "")],
          step: state.step, // Keep same step
        };
      }

      // Valid response - use generated follow-up
      const newResponses = {
        [question.key]: userInput,
      };

      if (isLastQuestion) {
        // Last question with custom response - show acknowledgment, mark step complete but not full completion yet
        return {
          responses: newResponses,
          lastUserResponse: userInput,
          step: state.step,
          lastQuestionAcknowledged: true,
          messages: [new AIMessage(validationResult.followUpText || "")],
        };
      }

      return {
        responses: newResponses,
        lastUserResponse: userInput,
        step: state.step + 1,
        messages: [new AIMessage(validationResult.followUpText || "")],
      };
    }
  }

  // Store response for predefined options and custom responses (for last question)
  if (question && userInput) {
    const newResponses = {
      [question.key]: userInput,
    };

    // Check if this is the last question
    const isLastQuestion = state.step === ONBOARDING_QUESTIONS.length;

    if (isLastQuestion) {
      // Last question with predefined option - check if it's "Skip this question"
      const isSkip = userInput.toLowerCase().includes("skip");

      if (isSkip) {
        // Show acknowledgment for skipping
        return {
          responses: newResponses,
          lastUserResponse: userInput,
          step: state.step,
          lastQuestionAcknowledged: true,
          messages: [
            new AIMessage(
              "No worries at all! You've already shared so much valuable information. 🤍"
            ),
          ],
        };
      }

      // Store response and mark step complete but not full completion yet
      return {
        responses: newResponses,
        lastUserResponse: userInput,
        step: state.step,
        lastQuestionAcknowledged: true,
      };
    }

    // For predefined options, the askQuestionNode will handle the follow-up
    return {
      responses: newResponses,
      lastUserResponse: userInput,
      step: state.step + 1,
    };
  }

  // Skip optional question (empty input)
  if (question && !question.required && !userInput) {
    const isLastQuestion = state.step === ONBOARDING_QUESTIONS.length;

    if (isLastQuestion) {
      // Last question skipped with empty input - show acknowledgment
      return {
        step: state.step,
        lastQuestionAcknowledged: true,
        messages: [
          new AIMessage(
            "No worries at all! You've already shared so much valuable information. 🤍"
          ),
        ],
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
 * Node: Mark Onboarding as Complete
 * Intermediate node to mark onboarding as complete after acknowledgment
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function markCompleteNode(_state: OnboardingStateType) {
  return {
    isComplete: true,
    step: ONBOARDING_QUESTIONS.length + 1,
  };
}

/**
 * Node: Complete Onboarding
 * Final message before redirecting to T&C
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function completeNode(_state: OnboardingStateType) {
  const message = `Thank you so much for sharing! That's all I need to create your personalized plan. 🤍

🎉 **Your responses have been saved!**

One last step: Please review and accept our Terms & Conditions to continue.

Click "Proceed to Terms & Conditions" below to continue.`;

  return {
    messages: [new AIMessage(message)],
  };
}
