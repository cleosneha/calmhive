"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";

interface Props {
  activity: string;
  notes?: string | null;
  status?: string;
  onEdit?: () => void;
  children: React.ReactNode;
}

// Convert semicolon or comma-separated text to markdown format
function convertToMarkdown(text: string): string {
  if (!text) return "";

  // If it already contains markdown list markers, return as-is
  if (text.includes("- ") || text.includes("\n")) {
    return text;
  }

  // Split by semicolon and convert to markdown list
  if (text.includes(";")) {
    return text
      .split(";")
      .map((item) => `- ${item.trim()}`)
      .join("\n");
  }

  // If single line with commas, keep as-is for now
  return text;
}

export default function TaskHoverCard({
  activity,
  notes,
  status,
  onEdit,
  children,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  }>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const calculatePosition = () => {
      const trigger = triggerRef.current;
      const card = cardRef.current;

      if (!trigger || !card) return;

      // Get table container (closest ancestor with overflow-x-auto)
      const tableContainer = trigger.closest(".overflow-x-auto");
      if (!tableContainer) return;

      const tableRect = tableContainer.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      let top: string | undefined;
      let bottom: string | undefined;
      let left: string | undefined;
      let right: string | undefined;

      // Calculate if there's space below
      const spaceBelow = tableRect.bottom - triggerRect.bottom;
      const spaceAbove = triggerRect.top - tableRect.top;

      if (spaceBelow > cardRect.height + 10) {
        // Open below
        top = `calc(100% + 8px)`;
      } else if (spaceAbove > cardRect.height + 10) {
        // Open above
        bottom = `calc(100% + 8px)`;
      } else {
        // Default to below if not enough space either way
        top = `calc(100% + 8px)`;
      }

      // Calculate if there's space on the right
      const spaceRight = tableRect.right - triggerRect.right;
      const spaceLeft = triggerRect.left - tableRect.left;

      if (spaceRight > cardRect.width + 10) {
        // Open to the right
        left = "0";
      } else if (spaceLeft > cardRect.width + 10) {
        // Open to the left
        right = "0";
      } else {
        // Default to right
        left = "0";
      }

      setPosition({
        ...(top && { top }),
        ...(bottom && { bottom }),
        ...(left && { left }),
        ...(right && { right }),
      });
    };

    // Calculate position after a brief delay to ensure card is rendered
    const timer = setTimeout(calculatePosition, 0);
    window.addEventListener("resize", calculatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculatePosition);
    };
  }, [isOpen]);

  const formattedNotes = notes ? convertToMarkdown(notes) : null;

  return (
    <div
      ref={triggerRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {children}

      {isOpen && (
        <>
          {/* Invisible spacer to keep hover active between trigger and card */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: 0,
              top: "100%",
              width: "100%",
              height: "8px",
            }}
          />

          {/* Hover Card */}
          <div
            ref={cardRef}
            className="absolute z-40 w-72 bg-white border border-slate-200 rounded shadow-lg p-3 pointer-events-auto"
            style={position as React.CSSProperties}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            <div className="space-y-2">
              <div className="font-semibold text-[var(--ch-sage-dark)]">
                {activity}
              </div>
              <div className="text-sm text-[var(--foreground)]/80 prose prose-sm max-w-none">
                {formattedNotes ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="m-0 text-sm">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="m-0 pl-4 text-sm list-disc">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="m-0 pl-4 text-sm list-decimal">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="m-0 text-sm">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                    }}
                  >
                    {formattedNotes}
                  </ReactMarkdown>
                ) : (
                  "No notes provided."
                )}
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-[var(--foreground)]/70">
                  Status:{" "}
                  <span className="font-medium">{status ?? "unknown"}</span>
                </div>
                <Button size="sm" variant="ghost" onClick={onEdit}>
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
