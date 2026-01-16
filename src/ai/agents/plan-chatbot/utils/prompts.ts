/**
 * Centralized prompts for plan chatbot
 */

export function buildAnalysisPrompt(userMessage: string): string {
  return `Analyze user message about their wellness plan.

User message: "${userMessage}"

Output:
IS_EDIT_REQUEST: [yes/no]
SAFETY: [safe/concern]
RELEVANCE: [yes/no]
EDIT_TYPE: [add_task/remove_task/modify_task/change_days_off/other/none]
DAY: [Monday-Sunday or "none"]
TIME_RANGE: [e.g., "6:00 AM - 7:00 AM" or "none"]
ACTIVITY: [activity name or "none"]
DAYS_OFF: [comma-separated days or "none"]

Rules:
- IS_EDIT_REQUEST=yes ONLY if user explicitly wants to add/remove/change tasks or days off
- SAFETY=concern if message contains:
  * Self-harm or suicidal ideation (e.g., "kill myself", "end my life", "want to die")
  * Violence or harm to others
  * Dangerous or harmful wellness activities
  * Substance abuse or illegal activities
  * Any content that could endanger wellbeing
- RELEVANCE=no if message is completely unrelated to wellness/planning (jokes, random topics, etc.)
- IMPORTANT: Safety takes priority. If SAFETY=concern, always set IS_EDIT_REQUEST=no and EDIT_TYPE=none
- Extract specific details (day, time, activity) ONLY when IS_EDIT_REQUEST=yes
- For queries about the plan, set IS_EDIT_REQUEST=no
`;
}

export function buildQueryAnswerPrompt(
  planContext: string,
  userMessage: string
): string {
  return `You are a helpful wellness plan assistant. Answer the user's question about their plan.

${planContext}

User Question: "${userMessage}"

Provide a clear, concise answer based on the plan data above. Use markdown formatting for better readability.
If the question asks about a specific day or task, include relevant details.
Be friendly and helpful.`;
}

export function buildProcessMessagePrompt(
  userMessage: string,
  planContext?: string
): string {
  return `Analyze user message about wellness plan.

${planContext ? `Plan:\n${planContext}\n\n` : ""}Message: "${userMessage}"

Output:
IS_EDIT_REQUEST: yes/no
SAFETY: safe/concern
RELEVANCE: yes/no
EDIT_TYPE: add_task/remove_task/modify_task/change_days_off/none
DAY: Monday-Sunday or none
TIME_RANGE: e.g., 6:00 AM - 7:00 AM or none
OLD_ACTIVITY: current activity (modify_task only) or none
NEW_ACTIVITY: new activity name or none
9.NOTES: For add_task, include a concise, actionable 'notes' string formatted as a markdown list (use line breaks and dashes). Include 2–3 short practical steps or cues — this applies to all activity types (physical, mindfulness, journaling, social, etc.). Examples:
   - "Intense HIIT Workout" → "- warm-up: leg swings, high knees\n- main: squats, side runs\n- cool-down: stretching"
   - "Evening journaling" → "- 5-min freewrite\n- list 3 wins\n- set one intention". For remove_task set to none.
DAYS_OFF: comma-separated days or none
ANSWER: helpful answer if query, else none

Rules:
- SAFETY=concern: self-harm, violence, dangerous activities, substance abuse
- Safety priority: if concern, set IS_EDIT_REQUEST=no, EDIT_TYPE=none, ANSWER=none
- RELEVANCE=no: completely off-topic (jokes, unrelated topics)
- IS_EDIT_REQUEST=yes: only explicit add/remove/modify/days-off requests
- MODIFY: identify activity from plan, set OLD_ACTIVITY/NEW_ACTIVITY, ALWAYS generate helpful NOTES (3 points with dashes)
- ADD: set NEW_ACTIVITY, ALWAYS generate helpful NOTES (3 points with dashes), OLD_ACTIVITY=none
- REMOVE: set OLD_ACTIVITY, NEW_ACTIVITY=none, NOTES=none
- NOTES must be practical, specific, and actionable - NOT generic or vague
- ANSWER: provide if query (IS_EDIT_REQUEST=no AND RELEVANCE=yes)

`;
}
