import { useState, useEffect, useCallback } from "react";
import {
  startOnboardingSession,
  processOnboardingMessage,
} from "@/actions/onboarding";
import type { OnboardingMessage } from "@/types";

interface OnboardingSessionState {
  messages: OnboardingMessage[];
  input: string;
  loading: boolean;
  isComplete: boolean;
  waitingForSafetyAck: boolean;
  currentStep: number;
  currentGoalOptions: string[];
  firstName: string;
}

export function useOnboardingSession() {
  const [state, setState] = useState<OnboardingSessionState>({
    messages: [],
    input: "",
    loading: true,
    isComplete: false,
    waitingForSafetyAck: false,
    currentStep: 0,
    currentGoalOptions: [],
    firstName: "",
  });

  // Initialize onboarding session
  useEffect(() => {
    const initSession = async () => {
      try {
        const result = await startOnboardingSession();
        setState((prev) => ({
          ...prev,
          messages: Array.isArray(result.messages)
            ? (result.messages as OnboardingMessage[])
            : [],
          currentStep: typeof result.step === "number" ? result.step : 0,
          isComplete: !!result.isComplete,
          currentGoalOptions: Array.isArray(result.currentGoalOptions)
            ? result.currentGoalOptions
            : [],
          firstName: result.firstName || "",
        }));
      } catch (error) {
        console.error("Failed to start onboarding:", error);
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    initSession();
  }, []);

  // Handle sending messages
  const handleSend = useCallback(
    async (messageText?: string) => {
      const textToSend = messageText || state.input;
      if (!textToSend.trim()) return;

      setState((prev) => ({
        ...prev,
        input: "",
        messages: [
          ...prev.messages,
          {
            role: "user",
            content: textToSend,
          },
        ],
        loading: true,
      }));

      try {
        const result = await processOnboardingMessage(textToSend);
        setState((prev) => ({
          ...prev,
          messages: Array.isArray(result.messages)
            ? (result.messages as OnboardingMessage[])
            : [],
          currentStep: typeof result.step === "number" ? result.step : 0,
          isComplete: !!result.isComplete,
          waitingForSafetyAck: !!result.waitingForSafetyAck,
          currentGoalOptions: Array.isArray(result.currentGoalOptions)
            ? result.currentGoalOptions
            : [],
          loading: false,
        }));
      } catch (error: unknown) {
        console.error("Failed to process message:", error);

        // If session expired, restart the onboarding
        if (
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof (error as { message?: string }).message === "string" &&
          (error as { message: string }).message.includes("SESSION_EXPIRED")
        ) {
          console.log("Session expired, restarting onboarding...");
          try {
            const result = await startOnboardingSession();
            setState((prev) => ({
              ...prev,
              messages: Array.isArray(result.messages)
                ? (result.messages as OnboardingMessage[])
                : [],
              currentStep: typeof result.step === "number" ? result.step : 0,
              isComplete: !!result.isComplete,
              waitingForSafetyAck: !!result.waitingForSafetyAck,
              currentGoalOptions: Array.isArray(result.currentGoalOptions)
                ? result.currentGoalOptions
                : [],
              firstName: result.firstName || "",
              loading: false,
            }));
            return;
          } catch (restartError) {
            console.error("Failed to restart session:", restartError);
          }
        }

        setState((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              role: "assistant",
              content: "Something went wrong. Please try again.",
            },
          ],
          loading: false,
        }));
      }
    },
    [state.input]
  );

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !state.loading) {
        handleSend();
      }
    },
    [state.loading, handleSend]
  );

  const setInput = useCallback((input: string) => {
    setState((prev) => ({ ...prev, input }));
  }, []);

  return {
    ...state,
    handleSend,
    handleInputKeyDown,
    setInput,
  };
}
