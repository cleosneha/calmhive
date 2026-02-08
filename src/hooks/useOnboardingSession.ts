import { useState, useEffect, useCallback } from "react";
import {
  startOnboardingSession,
  processOnboardingMessage,
} from "@/actions/onboarding/onboarding";
import type { OnboardingMessage } from "@/types";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";
import { toast } from "sonner";

interface OnboardingSessionState {
  messages: OnboardingMessage[];
  input: string;
  loading: boolean;
  isComplete: boolean;
  waitingForSafetyAck: boolean;
  currentStep: number;
  currentGoalOptions: string[];
  firstName: string;
  selectedDays: string[];
  isMultiSelectMode: boolean;
  waitingForDateFormat: boolean;
}

interface ErrorResponse {
  status: "error";
  error: string;
  code?: string;
}

const isErrorResponse = (obj: unknown): obj is ErrorResponse => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    (obj as Record<string, unknown>).status === "error"
  );
};

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
    selectedDays: [],
    isMultiSelectMode: false,
    waitingForDateFormat: false,
  });

  // Initialize onboarding session
  useEffect(() => {
    const initSession = async () => {
      try {
        const result = await startOnboardingSession();

        // Check if result is an error response
        if (isErrorResponse(result)) {
          toast.error(result.error);
          console.error("Failed to start onboarding:", result.error);
          return;
        }

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
          selectedDays: Array.isArray(result.selectedDays)
            ? result.selectedDays
            : [],
          isMultiSelectMode: !!result.isMultiSelectMode,
          waitingForDateFormat: !!result.waitingForDateFormat,
        }));
      } catch (error) {
        console.error("Failed to start onboarding:", error);
        toast.error("Failed to start onboarding session");
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    initSession();
  }, []);

  // Check if current question is multi-select
  useEffect(() => {
    const currentQuestion = ONBOARDING_QUESTIONS[state.currentStep];
    if (currentQuestion?.multiSelect && !state.loading) {
      setState((prev) => ({ ...prev, isMultiSelectMode: true }));
    } else {
      setState((prev) => ({ ...prev, isMultiSelectMode: false }));
    }
  }, [state.currentStep, state.loading]);

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

        // Check if result is an error response
        if (isErrorResponse(result)) {
          toast.error(result.error);
          setState((prev) => ({
            ...prev,
            messages: [
              ...prev.messages,
              {
                role: "assistant",
                content: result.error,
              },
            ],
            loading: false,
          }));
          return;
        }

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
          selectedDays: Array.isArray(result.selectedDays)
            ? result.selectedDays
            : [],
          isMultiSelectMode: !!result.isMultiSelectMode,
          waitingForDateFormat: !!result.waitingForDateFormat,
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
          try {
            const result = await startOnboardingSession();

            // Check if restart result is an error
            if (isErrorResponse(result)) {
              toast.error(result.error);
              setState((prev) => ({
                ...prev,
                messages: [
                  ...prev.messages,
                  {
                    role: "assistant",
                    content: result.error,
                  },
                ],
                loading: false,
              }));
              return;
            }

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
              selectedDays: Array.isArray(result.selectedDays)
                ? result.selectedDays
                : [],
              isMultiSelectMode: !!result.isMultiSelectMode,
              waitingForDateFormat: !!result.waitingForDateFormat,
              loading: false,
            }));
            return;
          } catch (restartError) {
            console.error("Failed to restart session:", restartError);
            toast.error("Failed to restart session");
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
    [state.input],
  );

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !state.loading) {
        handleSend();
      }
    },
    [state.loading, handleSend],
  );

  const setInput = useCallback((input: string) => {
    setState((prev) => ({ ...prev, input }));
  }, []);

  const handleToggleDay = useCallback((day: string) => {
    setState((prev) => {
      const isNone = day === "None";
      const currentlySelected = prev.selectedDays;

      // If "None" is clicked, clear all other selections
      if (isNone) {
        return {
          ...prev,
          selectedDays: currentlySelected.includes("None") ? [] : ["None"],
        };
      }

      // If any other day is clicked, remove "None" if it's selected
      const withoutNone = currentlySelected.filter((d) => d !== "None");

      // Toggle the clicked day
      if (withoutNone.includes(day)) {
        return {
          ...prev,
          selectedDays: withoutNone.filter((d) => d !== day),
        };
      } else {
        return {
          ...prev,
          selectedDays: [...withoutNone, day],
        };
      }
    });
  }, []);

  const handleSendDays = useCallback(async () => {
    if (state.selectedDays.length === 0) return;

    // Validate: Cannot select all 7 days as off
    const allDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const selectedDaysWithoutNone = state.selectedDays.filter(
      (d) => d !== "None",
    );
    if (selectedDaysWithoutNone.length === allDays.length) {
      setState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            role: "assistant",
            content:
              "You need at least one active day for activities. Please select fewer days off.",
          },
        ],
      }));
      return;
    }

    const daysText =
      state.selectedDays.includes("None") || state.selectedDays.length === 0
        ? "None"
        : state.selectedDays.join(", ");

    setState((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          role: "user",
          content: daysText,
        },
      ],
      loading: true,
      isMultiSelectMode: false,
    }));

    try {
      const result = await processOnboardingMessage(daysText);

      // Check if result is an error response
      if (isErrorResponse(result)) {
        toast.error(result.error);
        setState((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              role: "assistant",
              content: result.error,
            },
          ],
          loading: false,
        }));
        return;
      }

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
        selectedDays: [],
        isMultiSelectMode: false,
        loading: false,
      }));
    } catch (error: unknown) {
      console.error("Failed to process message:", error);
      toast.error("Failed to send days");
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
  }, [state.selectedDays]);

  return {
    ...state,
    handleSend,
    handleInputKeyDown,
    setInput,
    handleToggleDay,
    handleSendDays,
  };
}
