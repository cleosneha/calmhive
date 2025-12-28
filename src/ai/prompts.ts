/**
 * AI Prompts for CalmHive
 */

/**
 * Generate a personalized weekly plan based on onboarding responses
 */
export function getWeeklyPlanPrompt(
  responses: Record<string, string>,
  userName: string
) {
  return `You are CalmHive's personalized wellness planner. Generate a gentle, achievable weekly plan for ${userName}.

**User's Preferences:**
- Goals: ${responses.goals || "General wellness"}
- Daily Time Available: ${responses.timeAvailability || "30-60 minutes"}
- Preferred Activities: ${responses.activities || "Mindful practices"}
- Most Energetic Time: ${responses.energeticTime || "Morning"}
- Additional Notes: ${responses.anythingElse || "None"}

**Requirements:**
1. Create 7 days of tasks (Monday-Sunday)
2. Each day should have 2-4 small, achievable tasks
3. Tasks should match their time availability and energy patterns
4. Focus on gentle, positive activities only
5. Keep tasks simple and non-medical
6. Total daily time should not exceed their availability
7. Tasks should feel supportive, not overwhelming

**Output Format (JSON only):**
\`\`\`json
{
  "title": "Your Personalized Weekly Plan",
  "description": "A gentle plan tailored just for you",
  "days": [
    {
      "day": "Monday",
      "tasks": [
        {
          "title": "Morning breathing exercise",
          "description": "5 minutes of deep breathing to start your day",
          "duration": "5 minutes",
          "time": "morning",
          "completed": false
        }
      ]
    }
  ]
}
\`\`\`

Generate the plan now:`;
}

/**
 * Create a summary text from onboarding responses for embedding
 */
export function createOnboardingSummary(
  responses: Record<string, string>
): string {
  const parts: string[] = [];

  if (responses.goals) {
    parts.push(`Goals: ${responses.goals}`);
  }

  if (responses.timeAvailability) {
    parts.push(`Time Availability: ${responses.timeAvailability}`);
  }

  if (responses.activities) {
    parts.push(`Preferred Activities: ${responses.activities}`);
  }

  if (responses.energeticTime) {
    parts.push(`Most Energetic Time: ${responses.energeticTime}`);
  }

  if (responses.anythingElse) {
    parts.push(`Additional Notes: ${responses.anythingElse}`);
  }

  return parts.join(". ");
}
