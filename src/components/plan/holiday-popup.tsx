"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { addHoliday } from "@/actions/plan/add-remove-holiday";
import { dateToISOString } from "@/utils/date";
import { toast } from "sonner";

interface HolidayPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date; // The date to mark as holiday
  onSuccess?: () => void; // Callback after successful holiday marking
}

export function HolidayPopup({
  open,
  onOpenChange,
  date,
  onSuccess,
}: HolidayPopupProps) {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Reset textarea height when dialog opens
  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [open]);

  const handleMarkHoliday = async () => {
    setIsLoading(true);
    try {
      // Convert date to ISO string using timezone-aware utility
      const isoDate = dateToISOString(date);

      const result = await addHoliday({
        date: isoDate,
        reason: reason.trim() || undefined,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setReason("");
      onOpenChange(false);

      // Call the success callback to refresh data
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error marking holiday:", error);
      toast.error("Failed to mark holiday");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] w-[90vw] gap-3 h-[50vh]">
        <DialogHeader className="pb-0">
          <DialogTitle className="text-lg">Mark as Holiday</DialogTitle>
          <DialogDescription className="text-sm">
            {date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="reason" className="text-sm">
              Reason (Optional)
            </Label>
            <textarea
              ref={textareaRef}
              id="reason"
              placeholder="e.g., Meeting, Sick leave, Personal work"
              value={reason}
              onChange={handleTextareaChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ch-sage-light)] focus:border-transparent resize-none"
              rows={2}
            />
            <p className="text-xs text-[var(--foreground)]/60">
              Add a reason for marking this day as a holiday (optional)
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="lowOpacityWhite"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleMarkHoliday}
            disabled={isLoading}
            variant="default"
          >
            {isLoading ? "Marking..." : "Mark as Holiday"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
