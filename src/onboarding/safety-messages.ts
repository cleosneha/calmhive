/**
 * Fixed safety messages for onboarding flow
 * Used when critical distress or severe health issues are detected
 */

export const CRITICAL_DISTRESS_MESSAGE = `I'm really sorry you're feeling this way. CalmHive is only designed to support gentle daily habits and relaxation.

Please reach out to a trusted friend, family member, or professional counselor/doctor right away.

You can continue onboarding whenever you're ready, or come back later.`;

export const DOCTOR_CONSULTATION_MESSAGE = `Thank you for sharing. It sounds like you may benefit from professional medical guidance.

CalmHive is designed for light daily habits and relaxation, not medical conditions.

Please consult your doctor or healthcare provider to address these concerns.

We're here to support your wellness journey once you've checked in with a professional. 🤍`;

/**
 * Critical triggers for rule-based safety check
 * If any of these patterns match, show CRITICAL_DISTRESS_MESSAGE immediately
 */
export const CRITICAL_TRIGGERS = [
  /suic/i,
  /kill myself/i,
  /self.?harm/i,
  /crisis/i,
  /end it all/i,
  /want to die/i,
  /better off dead/i,
];

/**
 * Harmful but non-critical patterns
 * These get a gentle redirect without stopping the flow
 */
export const HARMFUL_PATTERNS = [
  /drinking/i,
  /smoking/i,
  /overeating/i,
  /alcohol/i,
  /drugs/i,
];

export const HARMFUL_REDIRECT_MESSAGE = `Thanks for being open. I'll focus only on gentle, positive activities like walking, breathing, or reading.`;
