"use client";
import { useState, useRef, useEffect } from "react";
import { FiSend } from "react-icons/fi";
import { VscWand } from "react-icons/vsc";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  startOnboardingSession,
  processOnboardingMessage,
} from "@/actions/onboarding";
import { ONBOARDING_QUESTIONS } from "@/onboarding/questions";
import { Button } from "@/components/ui/button";

interface Message {
  role: "assistant" | "user";
  content: string;
}

export default function OnboardingChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Initialize onboarding session
  useEffect(() => {
    const initSession = async () => {
      try {
        const result = await startOnboardingSession();
        setMessages(
          Array.isArray(result.messages) ? (result.messages as Message[]) : []
        );
        setCurrentStep(typeof result.step === "number" ? result.step : 0);
        setIsComplete(!!result.isComplete);
      } catch (error) {
        console.error("Failed to start onboarding:", error);
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Redirect to terms when complete
  useEffect(() => {
    if (isComplete) {
      router.push("/onboarding/terms");
    }
  }, [isComplete, router]);

  // Get current question for options
  const getCurrentQuestion = () => {
    if (currentStep === 0 || currentStep > ONBOARDING_QUESTIONS.length) {
      return null;
    }
    return ONBOARDING_QUESTIONS[currentStep - 1];
  };

  const currentQuestion = getCurrentQuestion();

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    setLoading(true);
    setInput("");

    try {
      const result = await processOnboardingMessage(textToSend);
      setMessages(
        Array.isArray(result.messages) ? (result.messages as Message[]) : []
      );
      setCurrentStep(typeof result.step === "number" ? result.step : 0);
      setIsComplete(!!result.isComplete);
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
          setMessages(
            Array.isArray(result.messages) ? (result.messages as Message[]) : []
          );
          setCurrentStep(typeof result.step === "number" ? result.step : 0);
          setIsComplete(!!result.isComplete);
          return;
        } catch (restartError) {
          console.error("Failed to restart session:", restartError);
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      handleSend();
    }
  };

  const handleOptionClick = (option: string) => {
    setInput(option);
  };

  // Show readiness buttons on step 0
  const showReadinessButtons = currentStep === 0;

  // Show suggestions if current question has options
  const showSuggestions = !!(
    currentQuestion && currentQuestion.options.length > 0
  );

  if (loading && messages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--ch-sage-dark)] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-0">
      <div className="w-full max-w-3xl rounded-t-xl rounded-b-xl shadow-lg p-0 flex flex-col h-[92vh] md:h-[90vh] bg-transparent">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-[var(--ch-sage-dark)]/10 flex items-center justify-between rounded-t-xl bg-white">
          <div className="text-left">
            <h1 className="text-2xl font-bold text-[var(--ch-sage-dark)]">
              CalmHive Assistant
            </h1>
            <p className="text-sm text-[var(--foreground)]/60">
              Tell us about yourself to personalize your experience.
            </p>
          </div>
          <Image
            src="/calmhive.png"
            alt="CalmHive Logo"
            width={48}
            height={48}
            className="ml-4 drop-shadow-sm"
            priority
          />
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-transparent">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-3 max-w-[80%] text-base shadow-sm whitespace-pre-wrap ${
                  msg.role === "assistant"
                    ? "bg-[var(--ch-sage-light)] text-black"
                    : "bg-white text-black"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[var(--ch-sage-light)] rounded-2xl px-4 py-3 text-base">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestions and Readiness Buttons Above Input */}
        <div className="px-6 pt-4 pb-0 flex flex-col gap-2">
          {/* Readiness buttons for step 0 */}
          {showReadinessButtons && (
            <div className="flex flex-row items-start gap-2 mb-1">
              <span className="mt-0.5 text-[var(--ch-sage-dark)]">
                <VscWand className="w-4 h-4 inline-block align-middle" />
              </span>
              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  onClick={() => handleSend("Yes, ready to start")}
                  disabled={loading}
                  className="text-xs font-normal bg-[var(--ch-sage-light)] text-black px-3 py-1 mb-1 rounded-lg hover:bg-[var(--ch-sage-dark)] hover:text-white transition disabled:opacity-50 flex items-center text-left shadow-none border border-[var(--ch-sage-dark)]/10"
                  style={{ fontSize: "0.85rem", minHeight: 0, height: "auto" }}
                >
                  Yes, ready to start
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSend("No, not ready yet")}
                  disabled={loading}
                  className="text-xs font-normal bg-[var(--ch-sage-light)] text-black px-3 py-1 mb-1 rounded-lg hover:bg-[var(--ch-sage-dark)] hover:text-white transition disabled:opacity-50 flex items-center text-left shadow-none border border-[var(--ch-sage-dark)]/10"
                  style={{ fontSize: "0.85rem", minHeight: 0, height: "auto" }}
                >
                  No, not ready yet
                </Button>
              </div>
            </div>
          )}
          {/* Suggestions (vertical, above input) */}
          {showSuggestions && (
            <div className="flex flex-row items-start gap-2 mb-1">
              <span className="mt-0.5 text-[var(--ch-sage-dark)]">
                <VscWand className="w-4 h-4 inline-block align-middle" />
              </span>
              <div className="flex flex-col gap-1">
                {currentQuestion.options.map((option, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    onClick={() => handleOptionClick(option)}
                    disabled={loading}
                    className="text-xs font-normal bg-[var(--ch-sage-light)] text-black px-3 py-1 mb-1 rounded-lg hover:bg-[var(--ch-sage-dark)] hover:text-white transition disabled:opacity-50 flex items-center text-left shadow-none border border-[var(--ch-sage-dark)]/10"
                    style={{
                      fontSize: "0.85rem",
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

        {/* Chat Input */}
        <div className="px-6 py-4 border-t border-[var(--ch-sage-dark)]/10 bg-white flex gap-2 rounded-b-3xl">
          <input
            type="text"
            className="flex-1 rounded-xl border border-[var(--ch-sage-dark)]/20 px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[var(--ch-sage-dark)]"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            disabled={loading}
            autoFocus
          />
          <button
            className="bg-[var(--ch-sage-dark)] text-white rounded-xl px-4 py-2 flex items-center justify-center hover:bg-[var(--ch-sage-dark)]/90 transition disabled:opacity-50"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            aria-label="Send"
          >
            <FiSend className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
}
