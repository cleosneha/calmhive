// Centralized hardcoded messages used across plan chatbot nodes
export const HARD_CODED_MESSAGES = {
  IRRELEVANT:
    "I can help you with your wellness plan, but I can't assist with that request. Please ask about your schedule, tasks, or request plan changes.",

  SAFETY:
    "I appreciate you sharing that, but I want to make sure we're aligned. 🤍\n\n" +
    "It sounds like you might be going through something really difficult right now. Your safety and well-being are incredibly important to us.\n\n" +
    "There are people who genuinely care and want to help. You don't have to go through this alone. Please take that first step and reach out to someone today. 🤍",

  LLM_ERROR:
    "Sorry, I couldn't process that right now. Please try again in a moment.",

  UNDO_EXPIRED:
    "Sorry, the undo window has expired (5 minutes). This change can no longer be reversed.",

  UNDO_NOTHING:
    "There's no recent change to undo. Make an edit first, then you can undo it within 5 minutes.",

  CONFIRMATION_CANCEL:
    "That's totally fine. Please let me know if there is anything else that could be done. 🤍",

  EXECUTE_ERROR:
    "Sorry, I couldn't complete that change right now. Please try again.",

  QUOTA_EXCEEDED:
    "AI requests for today are complete. Please try again after some time. 🧘",
};
