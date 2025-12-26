"use client";
import { useState, useRef, useEffect } from "react";
import { FiSend } from "react-icons/fi";
import Image from "next/image";

const initialMessages = [
  {
    sender: "bot",
    text: "Hey there! 👋 Let's get started. What brings you to CalmHive today?",
  },
];

export default function OnboardingChatPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: "user", text: input }]);
    setInput("");
    // Simulate bot reply (replace with actual logic later)
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        {
          sender: "bot",
          text: "Thanks for sharing! (AI response here)",
        },
      ]);
    }, 800);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

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
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-2 max-w-[80%] text-base shadow-sm ${
                  msg.sender === "bot"
                    ? "bg-[var(--ch-sage-light)] text-black"
                    : "bg-white text-black"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
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
            autoFocus
          />
          <button
            className="bg-[var(--ch-sage-dark)] text-white rounded-xl px-4 py-2 flex items-center justify-center hover:bg-[var(--ch-sage-dark)]/90 transition"
            onClick={handleSend}
            aria-label="Send"
          >
            <FiSend className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
}
