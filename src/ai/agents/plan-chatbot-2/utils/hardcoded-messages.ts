/**
 * Centralized hardcoded messages for plan-chatbot-2
 */
export const MESSAGES = {
  GREETING: (userName?: string) => `Hi${
    userName ? ` ${userName.split(" ")[0]}` : ""
  }! I'm your Plan Assistant. I can help you:

- **Answer questions** about your current plan, tasks, or schedule
- **Edit your plan** by adding, removing, or modifying tasks

What would you like to know?`,

  IRRELEVANT:
    "I can help you with your wellness plan, but I can't assist with that request. " +
    "Please ask about your schedule, tasks, or request plan changes.",

  SAFETY:
    "I appreciate you sharing that, but I want to make sure we're aligned. 🤍\n\n" +
    "It sounds like you might be going through something really difficult right now. " +
    "Your safety and well-being are incredibly important to us.\n\n" +
    "There are people who genuinely care and want to help. You don't have to go through this alone. " +
    "Please take that first step and reach out to someone today. 🤍",

  QUOTA_EXCEEDED:
    "AI requests for today are complete. Please try again after some time. 🧘",

  CONFIRMATION_CANCEL:
    "That's totally fine. Please let me know if there is anything else that could be done. 🤍",

  CANCELLED:
    "Got it, I've cancelled that operation. Let me know if you need anything else!",

  EXECUTE_ERROR:
    "Sorry, I couldn't complete that change right now. Please try again.",

  ERROR: "Something went wrong. Please try again or rephrase your request.",

  NO_PLAN:
    "You don't have a wellness plan yet. Please create one first through the onboarding process.",

  SINGLE_OPERATION_ONLY:
    "I can only process **one operation at a time**.\n\n" +
    "**Currently supported operations:**\n" +
    "• Add/remove/modify tasks\n" +
    "• Mark days as off\n" +
    "• Remove days from plan\n" +
    "• Copy/rename/swap days\n" +
    "• Delete entire plan\n\n" +
    "Please specify which single operation you'd like me to perform.",

  JAILBREAK_ATTEMPT:
    "I can only help with wellness plan management. Let me know if you need help with your plan!",

  SUCCESS_PREFIX: "✅ **Plan updated successfully!**\n\n",
} as const;
