import type { OnboardingData } from "../types";
import { getAvailableDays } from "../tools/days-off-checker";

/**
 * Build the system prompt for plan generation
 */
export function buildPlanGenerationPrompt(
  data: OnboardingData,
  planSuggestions?: string | null,
): string {
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

${
  planSuggestions
    ? `**AI SUGGESTIONS FOR PLAN IMPROVEMENTS:**
${planSuggestions}

Please incorporate these suggestions while maintaining all constraints below.

`
    : ""
}**CRITICAL CONSTRAINTS (MUST FOLLOW):**
1. Only schedule activities on available days: ${availableDays.join(", ")}
2. NEVER schedule anything on days off: ${data.daysOff.join(", ")}
3. STRICTLY respect energetic time: ${data.energeticTime}
4. Maximum ${timeAvailabilityHours} hours per day, total across all activities
5. All activities MUST fall within the user's energetic time window

**Instructions:**
1. Create a weekly plan for available days only
2. Respect the time availability: maximum ${timeAvailabilityHours} hours per day
3. STRICTLY schedule all activities during the energetic time: ${
    data.energeticTime
  }. This is mandatory - NO exceptions.
4. Incorporate the user's preferred activities: ${data.activities}
5. Align activities with their goals: ${data.goals}
6. Break down activities into specific time blocks (e.g., "09:00-10:00")
7. Ensure time blocks are realistic and don't overlap
8. Include variety and balance throughout the week
9. For every activity, include a concise, actionable 'notes' string formatted as a markdown list (use line breaks and dashes). Include 2–3 short practical steps or cues — this applies to all activity types (physical, mindfulness, journaling, social, etc.). Examples:
   - "Intense HIIT Workout" → "- warm-up: leg swings, high knees\n- main: squats, side runs\n- cool-down: stretching"
   - "Evening journaling" → "- 5-min freewrite\n- list 3 wins\n- set one intention"
10. Add helpful notes for each activity when appropriate
11. Minimum 2-3 activities per day, but DO NOT exceed ${timeAvailabilityHours} hours per day
12. All activity start times MUST be within the energetic time window

**Output Format (JSON):**
Return a JSON array of tasks. Each task must have:
- day: string (e.g., "Monday")
- timeRange: string (e.g., "09:00-10:00" in 24-hour format)
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
