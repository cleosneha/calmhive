"use client";
import ReactMarkdown from "react-markdown";
import ThreeDotAnimation from "@/components/onboarding/three-dot-animation";
import type { OnboardingMessage } from "@/types";

interface ChatMessagesProps {
  messages: OnboardingMessage[];
  loading: boolean;
  chatEndRef: React.RefObject<HTMLDivElement>;
}

export default function ChatMessages({
  messages,
  loading,
  chatEndRef,
}: ChatMessagesProps) {
  return (
    <div className="relative z-30 flex flex-col flex-1">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex ${
            msg.role === "user" ? "justify-end" : "justify-start"
          } mb-4`}
        >
          <div
            className={`rounded-2xl px-3 py-2 lg:px-4 lg:py-3 max-w-[85%] lg:max-w-[80%] text-sm lg:text-base shadow-sm ${
              msg.role === "assistant"
                ? "bg-[var(--ch-sage-light)] text-black prose prose-sm max-w-none"
                : "bg-white text-black"
            }`}
          >
            {msg.role === "assistant" ? (
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold">{children}</strong>
                  ),
                  em: ({ children }) => <em className="italic">{children}</em>,
                  ul: ({ children }) => (
                    <ul className="list-disc ml-4 mb-2">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal ml-4 mb-2">{children}</ol>
                  ),
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                }}
              >
                {msg.content}
              </ReactMarkdown>
            ) : (
              <div className="whitespace-pre-wrap">{msg.content}</div>
            )}
          </div>
        </div>
      ))}
      {loading && (
        <div className="flex justify-start">
          <div className="bg-[var(--ch-sage-light)] rounded-2xl px-3 py-2 lg:px-4 lg:py-3 text-sm lg:text-base">
            <ThreeDotAnimation />
          </div>
        </div>
      )}
      <div ref={chatEndRef} />
    </div>
  );
}
