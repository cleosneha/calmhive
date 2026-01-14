"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { FiEdit } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import TaskEditDialog from "@/components/plan/task-edit";

interface Task {
  id: number;
  day: string;
  timeRange: string;
  activity: string;
  status: string;
  notes: string | null;
}

interface Props {
  task: Task;
  activity: string;
  notes?: string | null;
  status?: string;
  onEdit?: () => void;
  onTaskSave?: (task: Task) => Promise<void>;
  onTaskSaved?: () => Promise<void>; // Refetch plan after task save
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

// Small status badge component
function getStatusLabel(status?: string): string {
  if (!status) return "Unknown";
  const s = status.toLowerCase();
  if (s === "pending") return "Pending";
  if (s === "partial") return "Partially Done";
  if (s === "done") return "Done";
  if (s === "skipped") return "Skipped";
  return status;
}

function StatusBadge({ status }: { status?: string }): React.ReactNode {
  const label = getStatusLabel(status);
  const s = (status ?? "").toLowerCase();
  let cls = "text-[var(--foreground)]/80";
  if (s === "pending") cls = "text-amber-600";
  else if (s === "partial") cls = "text-yellow-600";
  else if (s === "done") cls = "text-emerald-600";
  else if (s === "skipped") cls = "text-slate-400";

  return <span className={`text-sm font-medium ${cls}`}>{label}</span>;
}

function EditIcon() {
  return <FiEdit className="w-4 h-4" />;
}

export default function TaskHoverCard({
  task,
  activity,
  notes,
  status,
  onTaskSave,
  onTaskSaved,
  children,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [position, setPosition] = useState<{
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  }>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on cleanup
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Handle mouse enter - clear any pending close timeout
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  // Handle mouse leave - delay card close
  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      closeTimeoutRef.current = null;
    }, 200); // 200ms delay before card disappears
  };

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
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isOpen && (
        <>
          {/* Hover Card */}
          <div
            ref={cardRef}
            className="absolute z-40 w-72 bg-white border border-slate-200 rounded shadow-lg pointer-events-auto"
            style={position as React.CSSProperties}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Header */}
            <div className="px-3 py-2 bg-[var(--ch-sage-dark)] text-white font-semibold rounded-t-md">
              {activity}
            </div>

            {/* Notes */}
            <div className="p-3 text-sm text-[var(--foreground)]/80 prose prose-sm max-w-none">
              {formattedNotes ? (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="m-0 text-sm">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="m-0 pl-4 text-sm list-disc">{children}</ul>
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
                <div className="text-sm">No notes provided.</div>
              )}
            </div>

            {/* Status centered */}
            <div className="px-3 pt-1 flex items-center justify-between ">
              <StatusBadge status={status} />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditDialogOpen(true)}
                className="inline-flex items-center gap-2 text-[var(--ch-sage)]"
                aria-label="Edit task"
              >
                <EditIcon />
                <span className="text-sm font-medium">Edit</span>
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Task Edit Dialog */}
      <TaskEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        task={task}
        onSave={onTaskSave}
        onTaskSaved={onTaskSaved}
      />
    </div>
  );
}
