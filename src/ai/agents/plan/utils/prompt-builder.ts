import type { OnboardingData } from "../types";
import { getAvailableDays } from "../tools/days-off-checker";

/**
 * Build the system prompt for plan generation
 */
export function buildPlanGenerationPrompt(data: OnboardingData): string {
  const availableDays = getAvailableDays(data.daysOff);
  const timeAvailabilityHours = data.timeAvailability / 60; // Convert minutes to hours
  const goalInfo =
    typeof data.goalSpecificInfo === "object"
      ? JSON.stringify(data.goalSpecificInfo)
      : String(data.goalSpecificInfo);

  return `You are CalmHive's wellness plan generator. Create a personalized weekly plan for a user based on their onboarding responses.

**User Profile:**
- Age: ${data.age}
- Goals: ${data.goals}
- Goal Details: ${goalInfo}
- Available Time: ${timeAvailabilityHours} hours per day (${
    data.timeAvailability
  } minutes)
- Preferred Activities: ${data.activities}
- Most Energetic Time: ${data.energeticTime}
- Days Off: ${data.daysOff.join(", ") || "None"}
- Available Days: ${availableDays.join(", ")}
- Additional Notes: ${data.additionalNotes || "None"}

**Instructions:**
1. Create a weekly plan for the available days only (${availableDays.join(
    ", "
  )})
2. DO NOT schedule anything on days off: ${data.daysOff.join(", ")}
3. Respect the time availability: maximum ${timeAvailabilityHours} hours per day
4. Consider the user's most energetic time (${
    data.energeticTime
  }) when scheduling activities
5. Never schedule activities outside of the time availability: maximum ${timeAvailabilityHours} hours per day and outside preferred energetic time (${
    data.energeticTime
  })
6. Incorporate the user's preferred activities: ${data.activities}
7. Align activities with their goals: ${data.goals}
8. Break down activities into specific time blocks (e.g., "09:00-10:00")
9. Ensure time blocks are realistic and don't overlap
10. Include variety and balance throughout the week
11. Add helpful notes for each activity when appropriate
12. Give minimum 3 activities per day, but do NOT exceed ${timeAvailabilityHours} hours per day

**Output Format (JSON):**
Return a JSON array of tasks. Each task must have:
- day: string (e.g., "Monday")
- timeRange: string (e.g., "09:00-10:00")
- activity: string (descriptive activity name)
- duration: number (in minutes)
- notes: string (optional, helpful guidance)

**Example:**
[
  {
    "day": "Monday",
    "timeRange": "07:00-08:00",
    "activity": "Morning yoga and stretching",
    "duration": 60,
    "notes": "Start your week with gentle movement"
  },
  {
    "day": "Monday",
    "timeRange": "19:00-19:30",
    "activity": "Evening journaling",
    "duration": 30,
    "notes": "Reflect on your day and set intentions"
  }
]

Generate a complete weekly plan now. Return ONLY the JSON array, no additional text.`;
}

/**
 * Build validation refinement prompt
 */
export function buildValidationRefinementPrompt(
  originalPlan: string,
  errors: string[],
  warnings: string[]
): string {
  return `The generated plan has validation issues. Please fix them and regenerate the plan.

**Original Plan:**
${originalPlan}

**Errors (must fix):**
${errors.join("\n")}

**Warnings:**
${warnings.join("\n")}

Please regenerate the plan addressing all errors. Return ONLY the corrected JSON array, no additional text.`;
}
