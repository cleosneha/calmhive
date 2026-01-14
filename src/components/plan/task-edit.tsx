"use client";

import { useState, useEffect } from "react";
import { generateNotesSuggestion } from "@/actions/plan/generate-notes-suggestion";
import {
  checkAIGenerationCount,
  incrementAIGenerationCount,
} from "@/actions/plan/check-and-increment-ai-count";
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
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { MdLightbulb } from "react-icons/md";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { saveTaskEdit } from "@/actions/plan/save-edit";

const taskEditSchema = z.object({
  activity: z.string().min(1, "Activity is required"),
  timeRange: z.string().min(1, "Time range is required"),
  notes: z.string().optional().nullable(),
  selfNotes: z.string().optional().nullable(),
});

type TaskEditFormData = z.infer<typeof taskEditSchema>;

interface Task {
  id: number;
  day: string;
  timeRange: string;
  activity: string;
  status: string;
  notes: string | null;
}

interface TaskEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onSave?: (task: Task) => Promise<void>;
  onTaskSaved?: () => Promise<void>; // Refetch plan data after task save
}

export default function TaskEditDialog({
  open,
  onOpenChange,
  task,
  onSave,
  onTaskSaved,
}: TaskEditDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [aiUsedCount, setAiUsedCount] = useState(0);
  const [aiLimit, setAiLimit] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const form = useForm<TaskEditFormData>({
    resolver: zodResolver(taskEditSchema),
    values: task
      ? {
          activity: task.activity || "",
          timeRange: task.timeRange || "",
          notes: task.notes || "",
          selfNotes: "",
        }
      : {
          activity: "",
          timeRange: "",
          notes: "",
          selfNotes: "",
        },
  });

  const handleSave = async (data: TaskEditFormData): Promise<void> => {
    if (!task) return;

    setIsSaving(true);
    try {
      const updatePayload = {
        id: task.id,
        day: task.day,
        timeRange: data.timeRange,
        activity: data.activity,
        status: task.status as "pending" | "done" | "skipped" | "partial",
        notes: data.notes || null,
        personalNotes: data.selfNotes || null,
      };

      const result = await saveTaskEdit(updatePayload);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      if (onSave) {
        await onSave(updatePayload);
      }

      // Refetch plan data
      if (onTaskSaved) {
        await onTaskSaved();
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Error saving task:", error);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the task details below and click save.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSave)}>
          <FieldGroup>
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

            {/* Time Range Field */}
            <Field>
              <FieldLabel>Time Range</FieldLabel>
              <FieldContent>
                <Input
                  placeholder="e.g., 10:00-11:00"
                  {...form.register("timeRange")}
                />
                <FieldError
                  errors={
                    form.formState.errors.timeRange
                      ? [form.formState.errors.timeRange]
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
                          onClick={async () => {
                            if (aiUsedCount >= aiLimit) {
                              toast.error(
                                `AI suggestion limit reached (${aiLimit}/24h)`
                              );
                              return;
                            }

                            const activity =
                              form.getValues("activity") ||
                              task?.activity ||
                              "";
                            if (!activity.trim()) {
                              toast.error(
                                "Please enter an activity title first"
                              );
                              return;
                            }

                            try {
                              setIsGenerating(true);

                              // Check if can use and increment
                              const countResult =
                                await incrementAIGenerationCount();
                              if (!countResult.success || !countResult.canUse) {
                                toast.error(
                                  countResult.message ||
                                    "Cannot generate notes at this time"
                                );
                                return;
                              }

                              // Generate notes
                              const res = await generateNotesSuggestion(
                                activity
                              );
                              if (!res.success) {
                                toast.error(
                                  res.message || "Failed to generate notes"
                                );
                                return;
                              }

                              const notesText = (res.notes || [])
                                .map((n) => `- ${n}`)
                                .join("\n");

                              form.setValue("notes", notesText);

                              // Update local count
                              setAiUsedCount(
                                countResult.newCount || aiUsedCount + 1
                              );

                              toast.success(
                                "AI notes generated and inserted into Notes"
                              );
                            } catch (error) {
                              console.error("Error generating notes:", error);
                              toast.error("Failed to generate notes");
                            } finally {
                              setIsGenerating(false);
                            }
                          }}
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

            {/* Self Notes Field */}
            <Field>
              <FieldLabel>Personal Notes</FieldLabel>
              <FieldContent>
                <Textarea
                  placeholder="Add your personal notes about this task"
                  rows={3}
                  {...form.register("selfNotes")}
                />
                <FieldError
                  errors={
                    form.formState.errors.selfNotes
                      ? [form.formState.errors.selfNotes]
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
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
