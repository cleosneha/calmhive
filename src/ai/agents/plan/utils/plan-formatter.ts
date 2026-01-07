import type { PlanTask } from "../types";

/**
 * Format plan for storage in database
 */
export function formatPlanForDB(tasks: PlanTask[], daysOff: string[]) {
  return {
    tasks: tasks.map((task) => ({
      day: task.day,
      timeRange: task.timeRange,
      activity: task.activity,
      duration: task.duration,
      notes: task.notes || "",
    })),
    daysOff,
  };
}

/**
 * Parse AI response to extract JSON tasks
 */
export function parseAIResponse(response: string): PlanTask[] {
  try {
    // Remove markdown code blocks if present
    let cleaned = response.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/```\n?/g, "");
    }

    // Parse JSON
    const parsed = JSON.parse(cleaned);

    // Validate structure
    if (!Array.isArray(parsed)) {
      throw new Error("Response is not an array");
    }

    // Ensure all tasks have required fields
    return parsed.map((task: unknown) => {
      if (
        typeof task !== "object" ||
        task === null ||
        !("day" in task) ||
        !("timeRange" in task) ||
        !("activity" in task) ||
        !("duration" in task)
      ) {
        throw new Error("Invalid task structure");
      }

      return {
        day: String(task.day),
        timeRange: String(task.timeRange),
        activity: String(task.activity),
        duration: Number(task.duration),
        notes: "notes" in task ? String(task.notes) : undefined,
      };
    });
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw new Error(
      `Failed to parse plan from AI response: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Format plan for display
 */
export function formatPlanForDisplay(tasks: PlanTask[]): string {
  const grouped: Record<string, PlanTask[]> = {};

  tasks.forEach((task) => {
    if (!grouped[task.day]) {
      grouped[task.day] = [];
    }
    grouped[task.day].push(task);
  });

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return days
    .filter((day) => grouped[day])
    .map((day) => {
      const dayTasks = grouped[day];
      const taskList = dayTasks
        .map(
          (task) =>
            `  ${task.timeRange} - ${task.activity}${
              task.notes ? ` (${task.notes})` : ""
            }`
        )
        .join("\n");
      return `**${day}:**\n${taskList}`;
    })
    .join("\n\n");
}
