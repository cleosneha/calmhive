"use client";
import { useEffect, useRef } from "react";
import { FiSend, FiPlay } from "react-icons/fi";
import Image from "next/image";
import ChatMessages from "@/components/onboarding/chat-messages";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePlanChatbotSession } from "@/hooks/usePlanChatbotSession";

export default function PlanChatbot({
  onPlanUpdate,
}: {
  onPlanUpdate?: () => void;
}) {
  const {
    messages,
    input,
    loading,
    handleSend,
    handleInputKeyDown,
    handleActionClick,
    setInput,
    isInitialized,
    initializeChat,
  } = usePlanChatbotSession();

  const chatEndRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;

  // Check if waiting for confirmation
  const waitingForConfirmation =
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    messages[messages.length - 1].actions !== undefined;

  // Auto-scroll when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check if plan was updated and trigger refresh
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (
        lastMessage.role === "assistant" &&
        lastMessage.content.includes("Plan updated successfully")
      ) {
        onPlanUpdate?.();
      }
    }
  }, [messages, onPlanUpdate]);

  // Show initialization screen if not initialized
  if (!isInitialized) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <div className="px-4 py-3 border-b border-[var(--ch-sage-dark)]/10 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[var(--ch-sage-dark)]">
              Plan Assistant
            </h2>
            <p className="text-xs text-[var(--foreground)]/60">
              Get help with your wellness plan
            </p>
          </div>
        </div>

        <div className="px-4 py-8 h-64 lg:h-72 flex flex-col items-center justify-center gap-8">
          {/* Plan chatbot illustration */}
          <div className="relative w-56 h-48">
            <Image
              src="/assets/plan-chatbot.png"
              alt="Plan Assistant"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Start button */}
          <Button
            onClick={initializeChat}
            disabled={loading}
            className="bg-[var(--ch-sage-dark)] text-white px-6 py-2 rounded-lg hover:bg-[var(--ch-sage-dark)]/90 transition flex items-center gap-2 font-medium"
          >
            <FiPlay className="w-4 h-4" />
            Start Chat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm h-full flex flex-col relative">
      {/* Background image (show when chat has started) */}
      {messages.length > 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center z-0">
          <div className="hidden lg:block w-56 h-48 mt-12 opacity-10">
            <Image
              src="/assets/plan-chatbot.png"
              alt="Plan Assistant Background"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}

      {/* Fixed Header */}
      <div className="px-4 py-3 border-b border-[var(--ch-sage-dark)]/10 flex items-center justify-between bg-white z-10 flex-shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-[var(--ch-sage-dark)]">
            Plan Assistant
          </h2>
          <p className="text-xs text-[var(--foreground)]/60">
            Ask questions or request changes to your plan
          </p>
        </div>
      </div>

      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 relative z-10">
        <ChatMessages
          messages={messages}
          loading={loading}
          chatEndRef={chatEndRef}
          onActionClick={handleActionClick}
          compact
        />
      </div>

      {/* Fixed Input Area */}
      <div className="px-4 py-3 border-t border-[var(--ch-sage-dark)]/10 bg-white z-10 flex-shrink-0">
        {/* Action buttons when waiting for confirmation */}
        {waitingForConfirmation &&
          messages[messages.length - 1].actions &&
          messages[messages.length - 1].actions?.map((action, index) => (
            <div key={index} className="mb-2 flex gap-2">
              <Button
                type="button"
                onClick={() => handleActionClick(action.label)}
                disabled={loading}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  action.type === "confirm"
                    ? "bg-[var(--ch-sage-dark)] text-white hover:bg-[var(--ch-sage-dark)]/90"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                {action.label}
              </Button>
            </div>
          ))}

        {/* Input area (disabled when waiting for confirmation) */}
        {!waitingForConfirmation && (
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              disabled={loading}
              className="flex-1 rounded-xl border border-[var(--ch-sage-dark)]/20 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ch-sage-dark)]"
            />
            <Button
              type="button"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-[var(--ch-sage-dark)] text-white rounded-xl w-9 h-9 flex items-center justify-center hover:bg-[var(--ch-sage-dark)]/90"
              aria-label="Send"
            >
              <FiSend className="text-base" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
