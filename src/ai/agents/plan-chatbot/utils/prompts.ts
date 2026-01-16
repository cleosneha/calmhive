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

Examples:
Message: "Add yoga on Monday at 6 AM"
IS_EDIT_REQUEST: yes
SAFETY: safe
RELEVANCE: yes
EDIT_TYPE: add_task
DAY: Monday
TIME_RANGE: 6:00 AM - 7:00 AM
ACTIVITY: yoga
DAYS_OFF: none

Message: "What tasks do I have tomorrow?"
IS_EDIT_REQUEST: no
SAFETY: safe
RELEVANCE: yes
EDIT_TYPE: none
DAY: none
TIME_RANGE: none
ACTIVITY: none
DAYS_OFF: none

Message: "I want to kill myself"
IS_EDIT_REQUEST: no
SAFETY: concern
RELEVANCE: no
EDIT_TYPE: none
DAY: none
TIME_RANGE: none
ACTIVITY: none
DAYS_OFF: none

Message: "Tell me a joke"
IS_EDIT_REQUEST: no
SAFETY: safe
RELEVANCE: no
EDIT_TYPE: none
DAY: none
TIME_RANGE: none
ACTIVITY: none
DAYS_OFF: none`;
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
