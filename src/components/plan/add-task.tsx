"use client";

import { useState, useEffect, useRef } from "react";
import { generateNotesSuggestion } from "@/actions/plan/generate-notes-suggestion";
import {
  checkAIGenerationCount,
  incrementAIGenerationCount,
} from "@/actions/plan/check-and-increment-ai-count";
import { addTask } from "@/actions/plan/add-task";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { TimePickerInput } from "@/components/ui/time-picker-input";
import { MdLightbulb } from "react-icons/md";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const addTaskSchema = z.object({
  day: z.string().min(1, "Day is required"),
  activity: z.string().min(1, "Activity is required"),
  time: z.date(),
  notes: z.string().optional().nullable(),
  personalNotes: z.string().optional().nullable(),
});

type AddTaskFormData = z.infer<typeof addTaskSchema>;

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskAdded?: () => Promise<void>; // Refetch plan data after task add
}

export default function AddTaskDialog({
  open,
  onOpenChange,
  onTaskAdded,
}: AddTaskDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [aiUsedCount, setAiUsedCount] = useState(0);
  const [aiLimit, setAiLimit] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fromTime, setFromTime] = useState<Date>(
    new Date(new Date().setHours(0, 0, 0, 0))
  );
  const [toTime, setToTime] = useState<Date>(
    new Date(new Date().setHours(1, 0, 0, 0))
  );

  const fromHourRef = useRef<HTMLInputElement>(null);
  const fromMinuteRef = useRef<HTMLInputElement>(null);
  const toHourRef = useRef<HTMLInputElement>(null);
  const toMinuteRef = useRef<HTMLInputElement>(null);

  // Fetch AI count when dialog opens
  useEffect(() => {
    if (open) {
      const fetchAICount = async () => {
        const result = await checkAIGenerationCount();
        if (result.success) {
          setAiUsedCount(result.currentCount);
          setAiLimit(result.limit);
        }
      };
      fetchAICount();
    }
  }, [open]);

  const form = useForm<AddTaskFormData>({
    resolver: zodResolver(addTaskSchema),
    defaultValues: {
      day: "",
      activity: "",
      time: new Date(new Date().setHours(0, 0, 0, 0)),
      notes: "",
      personalNotes: "",
    },
  });

  const handleSave = async (data: AddTaskFormData): Promise<void> => {
    setIsSaving(true);
    try {
      const fromHours = String(fromTime.getHours()).padStart(2, "0");
      const fromMinutes = String(fromTime.getMinutes()).padStart(2, "0");
      const toHours = String(toTime.getHours()).padStart(2, "0");
      const toMinutes = String(toTime.getMinutes()).padStart(2, "0");
      const timeRange = `${fromHours}:${fromMinutes}-${toHours}:${toMinutes}`;

      const result = await addTask({
        day: data.day,
        timeRange,
        activity: data.activity,
        notes: data.notes || null,
        personalNotes: data.personalNotes || null,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      // Refetch plan data
      if (onTaskAdded) {
        await onTaskAdded();
      }

      onOpenChange(false);
      form.reset();
      setFromTime(new Date(new Date().setHours(0, 0, 0, 0)));
      setToTime(new Date(new Date().setHours(1, 0, 0, 0)));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Error adding task:", error);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  async function handleGenerateNotes() {
    if (aiUsedCount >= aiLimit) {
      toast.error(`AI suggestion limit reached (${aiLimit}/24h)`);
      return;
    }

    const activity = form.getValues("activity") || "";
    if (!activity.trim()) {
      toast.error("Please enter an activity title first");
      return;
    }

    try {
      setIsGenerating(true);

      const countResult = await incrementAIGenerationCount();
      if (!countResult.success || !countResult.canUse) {
        toast.error(
          countResult.message || "Cannot generate notes at this time"
        );
        return;
      }

      const res = await generateNotesSuggestion(activity);
      if (!res.success) {
        toast.error(res.message || "Failed to generate notes");
        return;
      }

      const notesText = (res.notes || []).map((n) => `- ${n}`).join("\n");

      form.setValue("notes", notesText);
      setAiUsedCount(countResult.newCount || aiUsedCount + 1);
      toast.success("AI notes generated and inserted into Notes");
    } catch (error) {
      console.error("Error generating notes:", error);
      toast.error("Failed to generate notes");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Add a new activity to your wellness plan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSave)}>
          <FieldGroup>
            {/* Day Field */}
            <Field>
              <FieldLabel>Day</FieldLabel>
              <FieldContent>
                <Select
                  value={form.watch("day")}
                  onValueChange={(value) => form.setValue("day", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError
                  errors={
                    form.formState.errors.day
                      ? [form.formState.errors.day]
                      : undefined
                  }
                />
              </FieldContent>
            </Field>

            {/* Activity/Title Field */}
            <Field>
              <FieldLabel>Activity/Title</FieldLabel>
              <FieldContent>
                <Input
                  placeholder="Enter activity name"
                  {...form.register("activity")}
                />
                <FieldError
                  errors={
                    form.formState.errors.activity
                      ? [form.formState.errors.activity]
                      : undefined
                  }
                />
              </FieldContent>
            </Field>

            {/* Time Picker Fields (From - To) */}
            <Field>
              <FieldLabel>Time Range</FieldLabel>
              <FieldContent>
                <div className="flex flex-col md:flex-row md:items-end md:gap-8">
                  {/* From Time */}
                  <div className="w-full md:w-1/2">
                    <Label className="text-xs mb-2 block">From</Label>
                    <div className="flex items-end gap-2">
                      <div className="grid gap-1 text-center">
                        <Label htmlFor="fromHours" className="text-xs">
                          Hours
                        </Label>
                        <TimePickerInput
                          picker="hours"
                          date={fromTime}
                          setDate={(date) => date && setFromTime(date)}
                          ref={fromHourRef}
                          onRightFocus={() => fromMinuteRef.current?.focus()}
                        />
                      </div>
                      <div className="text-lg font-semibold">:</div>
                      <div className="grid gap-1 text-center">
                        <Label htmlFor="fromMinutes" className="text-xs">
                          Minutes
                        </Label>
                        <TimePickerInput
                          picker="minutes"
                          date={fromTime}
                          setDate={(date) => date && setFromTime(date)}
                          ref={fromMinuteRef}
                          onLeftFocus={() => fromHourRef.current?.focus()}
                          onRightFocus={() => toHourRef.current?.focus()}
                        />
                      </div>
                    </div>
                  </div>

                  {/* To Time */}
                  <div className="w-full md:w-1/2 mt-4 md:mt-0">
                    <Label className="text-xs mb-2 block">To</Label>
                    <div className="flex items-end gap-2">
                      <div className="grid gap-1 text-center">
                        <Label htmlFor="toHours" className="text-xs">
                          Hours
                        </Label>
                        <TimePickerInput
                          picker="hours"
                          date={toTime}
                          setDate={(date) => date && setToTime(date)}
                          ref={toHourRef}
                          onRightFocus={() => toMinuteRef.current?.focus()}
                          onLeftFocus={() => fromMinuteRef.current?.focus()}
                        />
                      </div>
                      <div className="text-lg font-semibold">:</div>
                      <div className="grid gap-1 text-center">
                        <Label htmlFor="toMinutes" className="text-xs">
                          Minutes
                        </Label>
                        <TimePickerInput
                          picker="minutes"
                          date={toTime}
                          setDate={(date) => date && setToTime(date)}
                          ref={toMinuteRef}
                          onLeftFocus={() => toHourRef.current?.focus()}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <FieldError
                  errors={
                    form.formState.errors.time
                      ? [form.formState.errors.time]
                      : undefined
                  }
                />
              </FieldContent>
            </Field>

            {/* Notes Field */}
            <Field>
              <FieldLabel>
                <div className="flex items-center justify-between w-full">
                  <span>Notes</span>
                  <span className="text-xs text-[var(--foreground)]/70">
                    {aiUsedCount}/{aiLimit} times AI used (24h)
                  </span>
                </div>
              </FieldLabel>
              <FieldContent>
                <div className="relative w-full">
                  <Textarea
                    placeholder="Add activity notes (supports markdown)"
                    rows={3}
                    {...form.register("notes")}
                  />

                  {/* Bulb icon with tooltip and generation logic */}
                  <div className="absolute top-2 right-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label="Generate by AI"
                          className="p-1 text-[var(--ch-sage-dark)]"
                          onClick={handleGenerateNotes}
                          disabled={isGenerating}
                        >
                          <MdLightbulb className="w-5 h-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent
                        sideOffset={4}
                        className="bg-white text-[var(--foreground)] border border-slate-200 shadow-sm"
                      >
                        {isGenerating ? "Generating…" : "Generate by AI"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <FieldError
                  errors={
                    form.formState.errors.notes
                      ? [form.formState.errors.notes]
                      : undefined
                  }
                />
              </FieldContent>
            </Field>

            {/* Personal Notes Field */}
            <Field>
              <FieldLabel>Personal Notes</FieldLabel>
              <FieldContent>
                <Textarea
                  placeholder="Add your personal notes about this task"
                  rows={3}
                  {...form.register("personalNotes")}
                />
                <FieldError
                  errors={
                    form.formState.errors.personalNotes
                      ? [form.formState.errors.personalNotes]
                      : undefined
                  }
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-6 mt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} variant="default">
              {isSaving ? "Adding..." : "Add Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
