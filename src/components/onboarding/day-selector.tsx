"use client";
import { Button } from "@/components/ui/button";
import { FiCheck } from "react-icons/fi";

interface DaySelectorProps {
  options: string[];
  selectedDays: string[];
  onToggleDay: (day: string) => void;
  disabled?: boolean;
}

export default function DaySelector({
  options,
  selectedDays,
  onToggleDay,
  disabled = false,
}: DaySelectorProps) {
  const isSelected = (day: string) => selectedDays.includes(day);

  return (
    <div className="flex flex-row flex-wrap gap-2">
      {options.map((day) => {
        const selected = isSelected(day);
        return (
          <Button
            key={day}
            type="button"
            onClick={() => onToggleDay(day)}
            disabled={disabled}
            className={`text-xs lg:text-sm font-normal px-2 py-1 lg:px-3 lg:py-1.5 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-1 shadow-none border ${
              selected
                ? "bg-[var(--ch-sage-dark)] text-white border-[var(--ch-sage-dark)]"
                : "bg-[var(--ch-sage-light)] text-black border-[var(--ch-sage-dark)]/10 hover:bg-[var(--ch-sage-dark)] hover:text-white"
            }`}
            style={{
              minHeight: 0,
              height: "auto",
            }}
          >
            <span>{day}</span>
            {selected && <FiCheck className="w-4 h-4" />}
          </Button>
        );
      })}
    </div>
  );
}
