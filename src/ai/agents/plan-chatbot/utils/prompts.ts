/**
 * Centralized prompts for plan chatbot
 */

export function buildProcessMessagePrompt(
  userMessage: string,
  planContext?: string,
): string {
  return `Analyze user message about wellness plan.

${planContext ? `Plan:\n${planContext}\n\n` : ""}Message: "${userMessage}"

Output:
IS_EDIT_REQUEST: yes/no
SAFETY: safe/concern
RELEVANCE: yes/no
EDIT_TYPE: add_task/remove_task/modify_task/change_days_off/add_days_off/remove_days/copy_day/rename_day/swap_days/none
DAY: Monday-Sunday or none
TIME_RANGE: e.g., 6:00 AM - 7:00 AM or none
OLD_ACTIVITY: current activity (modify_task only) or none
NEW_ACTIVITY: new activity name or none
NOTES: For add_task, include a concise, actionable 'notes' string formatted as a markdown list (use line breaks and dashes). Include 2–3 short practical steps or cues — this applies to all activity types (physical, mindfulness, journaling, social, etc.). Examples:
   - "Intense HIIT Workout" → "- warm-up: leg swings, high knees\n- main: squats, side runs\n- cool-down: stretching"
   - "Evening journaling" → "- 5-min freewrite\n- list 3 wins\n- set one intention". For remove_task set to none.
DAYS_OFF: comma-separated days or none
SOURCE_DAY: day to copy/rename from (for copy_day/rename_day) or none
TARGET_DAY: day to copy/rename to (for copy_day/rename_day) or none
DAYS_TO_ADD: comma-separated days (for add_days_off) or none
DAYS_TO_REMOVE: comma-separated days (for remove_days) or none
DAY1: first day (for swap_days ONLY) or none
DAY2: second day (for swap_days ONLY) or none
ANSWER: helpful answer if query, else none

Rules:
- SAFETY=concern: self-harm, violence, dangerous activities, substance abuse
- Safety priority: if concern, set IS_EDIT_REQUEST=no, EDIT_TYPE=none, ANSWER=none
- RELEVANCE=no: completely off-topic (jokes, unrelated topics)
- IS_EDIT_REQUEST=yes: only explicit add/remove/modify/days-off/day-operation requests
- **CRITICAL**: If user mentions MULTIPLE operations (e.g., "swap X and Y AND delete Z"), extract ALL operations by filling multiple field sets. Do NOT extract only one operation. Example: "swap monday and tuesday and delete friday" → DAY1=Monday, DAY2=Tuesday, DAYS_TO_REMOVE=Friday (both operations extracted)

Day Operation Rules (CRITICAL - check these first):
- ALWAYS extract day names from user message when present. DO NOT leave fields empty if days are mentioned.
- SWAP_DAYS: Keywords "swap", "interchange", "switch", "exchange", OR when BOTH directions mentioned (X to Y AND Y to X)
  * Example: "swap Monday and Tuesday" → EDIT_TYPE=swap_days, DAY1=Monday, DAY2=Tuesday
  * Example: "I want to swap monday and tuesday" → EDIT_TYPE=swap_days, DAY1=Monday, DAY2=Tuesday
  * Example: "interchange monday with tuesday" → EDIT_TYPE=swap_days, DAY1=Monday, DAY2=Tuesday
  * Example: "change Monday to Tuesday and Tuesday to Monday" → EDIT_TYPE=swap_days, DAY1=Monday, DAY2=Tuesday
  * Example: "shift Monday to Tuesday and Tuesday to Monday" → EDIT_TYPE=swap_days, DAY1=Monday, DAY2=Tuesday
  * Example: "make monday to tuesday and tuesday to monday" → EDIT_TYPE=swap_days, DAY1=Monday, DAY2=Tuesday
  * IMPORTANT: If message contains BOTH "X to Y" AND "Y to X", it's ALWAYS swap_days, NOT rename_day
  * ALWAYS extract BOTH days from the message and set DAY1 and DAY2
  * If user says "swap X and Y" or "X to Y and Y to X", X goes in DAY1, Y goes in DAY2
- RENAME_DAY: Keywords "change", "rename" (ONE-WAY change only, must NOT have reverse direction)
  * Example: "change Monday to Tuesday" (only one direction) → EDIT_TYPE=rename_day, SOURCE_DAY=Monday, TARGET_DAY=Tuesday
  * Example: "rename wednesday to thursday" → EDIT_TYPE=rename_day, SOURCE_DAY=Wednesday, TARGET_DAY=Thursday
  * IMPORTANT: If BOTH directions mentioned (X to Y AND Y to X), it's swap_days, NOT rename_day
  * ALWAYS extract SOURCE_DAY (old) and TARGET_DAY (new) from message
- COPY_DAY: Keywords "copy", "use X for Y", "duplicate", "same as"
  * Example: "use Monday for Tuesday" → EDIT_TYPE=copy_day, SOURCE_DAY=Monday, TARGET_DAY=Tuesday
  * ALWAYS extract SOURCE_DAY (to copy from) and TARGET_DAY (to copy to) from message
- ADD_DAYS_OFF: Keywords "mark as off", "set as day off", "no work on"
  * Example: "mark Wednesday as day off" → EDIT_TYPE=add_days_off, DAYS_TO_ADD=Wednesday
  * ALWAYS extract all days mentioned and set DAYS_TO_ADD
- REMOVE_DAYS: Keywords "remove days", "delete days", "get rid of days"
  * Example: "remove Monday from plan" → EDIT_TYPE=remove_days, DAYS_TO_REMOVE=Monday
  * Example: "remove monday and tuesday" → EDIT_TYPE=remove_days, DAYS_TO_REMOVE=Monday,Tuesday
  * ALWAYS extract all days mentioned and set DAYS_TO_REMOVE

Task Operation Rules:
- MODIFY: identify activity from plan, set OLD_ACTIVITY
  * If user wants to change activity name: set NEW_ACTIVITY to new name
  * If user only wants to edit/update notes: set NEW_ACTIVITY=none (keep activity same)
  * ALWAYS generate helpful NOTES (3 points with dashes)
- ADD: set NEW_ACTIVITY, ALWAYS generate helpful NOTES (3 points with dashes), OLD_ACTIVITY=none
- REMOVE: set OLD_ACTIVITY, NEW_ACTIVITY=none, NOTES=none

General Rules:
- NOTES must be practical, specific, and actionable - NOT generic or vague
- ANSWER: provide if query (IS_EDIT_REQUEST=no AND RELEVANCE=yes)
- CRITICAL: If message contains BOTH "X to Y" AND "Y to X" patterns, it's swap_days (interchange), NOT rename_day
- Check for bidirectional patterns first before classifying as rename_day
- Examples of bidirectional (swap): "change X to Y and Y to X", "make X to Y and Y to X", "move X to Y and Y to X"

`;
}
