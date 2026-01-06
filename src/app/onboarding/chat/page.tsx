"use client";
import { useRef, useEffect } from "react";
import { FiSend } from "react-icons/fi";
import { VscWand } from "react-icons/vsc";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessages from "@/components/onboarding/chat-messages";
import { useOnboardingSession } from "@/hooks/useOnboardingSession";
import ChatSkeleton from "@/components/onboarding/chat-skeleton";
import DaySelector from "@/components/onboarding/day-selector";

export default function OnboardingChatPage() {
  const {
    messages,
    input,
    loading,
    isComplete,
    waitingForSafetyAck,
    currentStep,
    currentGoalOptions,
    firstName,
    selectedDays,
    isMultiSelectMode,
    handleSend,
    handleInputKeyDown,
    setInput,
    handleToggleDay,
  } = useOnboardingSession();

  const chatEndRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const router = useRouter();

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get current question for options
  const getCurrentQuestion = () => {
    if (currentStep >= ONBOARDING_QUESTIONS.length) {
      return null;
    }
    const question = ONBOARDING_QUESTIONS[currentStep];
    if (!question) return null;

    // Return a copy with the text replaced, don't mutate the original
    return {
      ...question,
      text: question.text.replace("{firstName}", firstName),
    };
  };

  const currentQuestion = getCurrentQuestion();

  const handleOptionClick = (option: string) => {
    handleSend(option);
  };

  const handleDaysSend = () => {
    if (selectedDays.length === 0) return;

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
    const selectedDaysWithoutNone = selectedDays.filter((d) => d !== "None");
    if (selectedDaysWithoutNone.length === allDays.length) {
      return;
    }

    const daysText =
      selectedDays.includes("None") || selectedDays.length === 0
        ? "None"
        : selectedDays.join(", ");

    handleSend(daysText);
  };

  // Show continue button for safety acknowledgment
  const showSafetyContinue = waitingForSafetyAck;

  // Show proceed to T&C button when complete
  const showProceedButton = isComplete;

  // Show suggestions if current question has options and not loading
  const showSuggestions = !!(
    currentQuestion &&
    !showSafetyContinue &&
    !showProceedButton &&
    !loading &&
    !isMultiSelectMode &&
    (currentQuestion.options.length > 0 ||
      (currentQuestion.key === "goalSpecificInfo" &&
        currentGoalOptions.length > 0))
  );

  // Show day selector for multi-select mode
  const showDaySelector = isMultiSelectMode && currentQuestion && !loading;

  // Get the options to display (use goalOptions for goalSpecificInfo, otherwise use question options)
  const optionsToDisplay =
    currentQuestion?.key === "goalSpecificInfo" && currentGoalOptions.length > 0
      ? currentGoalOptions
      : currentQuestion?.options || [];

  if (loading && messages.length === 0) {
    return <ChatSkeleton />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-0 relative">
      <div className="w-full max-w-3xl rounded-t-xl rounded-b-xl shadow-lg p-0 flex flex-col h-[92vh] lg:h-[90vh] bg-transparent relative z-10">
        {/* Chat Header */}
        <div className="px-4 py-3 lg:px-6 lg:py-4 border-b border-[var(--ch-sage-dark)]/10 flex items-center justify-between rounded-t-xl bg-white">
          <div className="text-left">
            <h1 className="text-lg lg:text-2xl font-bold text-[var(--ch-sage-dark)]">
              CalmHive Assistant
            </h1>
            <p className="text-xs lg:text-sm text-[var(--foreground)]/60">
              Tell us about yourself to personalize your experience.
            </p>
          </div>
          <Image
            src="/calmhive.png"
            alt="CalmHive Logo"
            width={36}
            height={36}
            className="ml-3 lg:ml-4 drop-shadow-sm lg:w-12 lg:h-12"
            priority
          />
        </div>

        {/* Background Image (Fixed - doesn't scroll with chat) */}
        <div className="absolute left-0 right-0 top-[60px] lg:top-[80px] bottom-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
          {/* Mobile background */}
          <Image
            src="/assets/onboarding-background.png"
            alt="Onboarding Background"
            fill
            style={{
              objectFit: "contain",
              opacity: 0.5,
            }}
            priority={false}
          />
        </div>

        {/* Chat Messages & Suggestions Container */}
        <div className="flex-1 overflow-y-auto px-4 py-3 lg:px-6 lg:py-4 space-y-4 lg:space-y-6 bg-transparent relative flex flex-col">
          {/* Messages and suggestions above background */}
          <ChatMessages
            messages={messages}
            loading={loading}
            chatEndRef={chatEndRef}
          />

          {/* Suggestions and Action Buttons (inside same container as messages) */}
          <div className="relative z-10 flex flex-col gap-2 mt-auto">
            {/* Show "Proceed to T&C" option when onboarding is complete */}
            {showProceedButton && (
              <div className="flex flex-row items-start gap-2 mb-1">
                <span className="mt-0.5 text-[var(--ch-sage-dark)]">
                  <VscWand className="w-4 h-4 inline-block align-middle" />
                </span>
                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    onClick={() => router.push("/onboarding/terms")}
                    disabled={loading}
                    className="text-xs lg:text-sm font-normal bg-[var(--ch-sage-light)] text-black px-2 py-1 lg:px-3 lg:py-1.5 mb-1 rounded-lg hover:bg-[var(--ch-sage-dark)] hover:text-white transition disabled:opacity-50 flex items-center text-left shadow-none border border-[var(--ch-sage-dark)]/10"
                    style={{
                      minHeight: 0,
                      height: "auto",
                    }}
                  >
                    Proceed to Terms & Conditions
                  </Button>
                </div>
              </div>
            )}

            {/* Show continue button for safety acknowledgment */}
            {showSafetyContinue && (
              <div className="flex flex-row items-start gap-2 mb-1">
                <span className="mt-0.5 text-[var(--ch-sage-dark)]">
                  <VscWand className="w-4 h-4 inline-block align-middle" />
                </span>
                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    onClick={() => handleSend("continue")}
                    disabled={loading}
                    className="text-xs lg:text-sm font-normal bg-[var(--ch-sage-light)] text-black px-2 py-1 lg:px-3 lg:py-1.5 mb-1 rounded-lg hover:bg-[var(--ch-sage-dark)] hover:text-white transition disabled:opacity-50 flex items-center text-left shadow-none border border-[var(--ch-sage-dark)]/10"
                    style={{
                      minHeight: 0,
                      height: "auto",
                    }}
                  >
                    Continue with onboarding
                  </Button>
                </div>
              </div>
            )}

            {/* Day Selector for multi-select (horizontal) */}
            {showDaySelector && (
              <div className="flex flex-row items-start gap-2 mb-1">
                <span className="mt-0.5 text-[var(--ch-sage-dark)]">
                  <VscWand className="w-4 h-4 inline-block align-middle" />
                </span>
                <DaySelector
                  options={currentQuestion.options}
                  selectedDays={selectedDays}
                  onToggleDay={handleToggleDay}
                  disabled={loading}
                />
              </div>
            )}

            {/* Suggestions (wrap on small screens) */}
            {showSuggestions && (
              <div className="flex flex-row items-start gap-2 mb-1">
                <span className="mt-0.5 text-[var(--ch-sage-dark)]">
                  <VscWand className="w-4 h-4 inline-block align-middle" />
                </span>
                <div className="flex flex-row flex-wrap gap-2">
                  {optionsToDisplay.map((option, idx) => (
                    <Button
                      key={idx}
                      type="button"
                      onClick={() => handleOptionClick(option)}
                      disabled={loading}
                      className="text-xs lg:text-sm font-normal bg-[var(--ch-sage-light)] text-black px-2 py-1 lg:px-3 lg:py-1.5 rounded-lg hover:bg-[var(--ch-sage-dark)] hover:text-white transition disabled:opacity-50 flex items-center text-left shadow-none border border-[var(--ch-sage-dark)]/10 whitespace-normal break-words max-w-full"
                      style={{
                        minHeight: 0,
                        height: "auto",
                      }}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Input - show unless complete; disable when waiting for safety ack */}
        {!isComplete && (
          <div className="px-4 py-3 lg:px-6 lg:py-4 border-t border-[var(--ch-sage-dark)]/10 bg-white flex gap-2 rounded-b-3xl">
            <Input
              type="text"
              className="flex-1 rounded-xl border border-[var(--ch-sage-dark)]/20 px-3 lg:px-4 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-[var(--ch-sage-dark)] h-9 lg:h-11 min-h-[36px] lg:min-h-[44px]"
              placeholder={
                waitingForSafetyAck
                  ? "Waiting for safety confirmation..."
                  : "Type your message..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              disabled={loading || waitingForSafetyAck || isMultiSelectMode}
              autoFocus={!waitingForSafetyAck && !isMultiSelectMode}
            />
            <Button
              type="button"
              onClick={() => {
                if (isMultiSelectMode) {
                  handleDaysSend();
                } else {
                  handleSend();
                }
              }}
              disabled={
                loading ||
                waitingForSafetyAck ||
                (isMultiSelectMode ? selectedDays.length === 0 : !input.trim())
              }
              aria-label={isMultiSelectMode ? "Send selected days" : "Send"}
              title={
                isMultiSelectMode ? "Send selected rest days" : "Send message"
              }
              className="bg-[var(--ch-sage-dark)] text-white rounded-xl flex items-center justify-center hover:bg-[var(--ch-sage-dark)]/90 transition disabled:opacity-50 cursor-pointer w-9 h-9 lg:w-11 lg:h-11 min-w-[36px] min-h-[36px] lg:min-w-[44px] lg:min-h-[44px] p-0"
            >
              <FiSend className="text-base lg:text-lg" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
