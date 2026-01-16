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
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm flex-1 min-h-0 flex flex-col relative">
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
      )}{" "}
      <div className="px-4 py-3 border-b border-[var(--ch-sage-dark)]/10 flex items-center justify-between relative z-10">
        <div>
          <h2 className="text-sm font-semibold text-[var(--ch-sage-dark)]">
            Plan Assistant
          </h2>
          <p className="text-xs text-[var(--foreground)]/60">
            Ask questions or request changes to your plan
          </p>
        </div>
      </div>
      <div className="px-4 py-3 flex-1 flex flex-col min-h-0 relative z-10">
        <div className="flex-1 overflow-y-auto pb-2">
          <ChatMessages
            messages={messages}
            loading={loading}
            chatEndRef={chatEndRef}
            onActionClick={handleActionClick}
            compact
          />
        </div>

        <div className="mt-2 flex gap-2">
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
      </div>
    </div>
  );
}
