````markdown
# CalmHive Onboarding — Technical Flow & Implementation Guide (Final Version)

This is the complete, final technical specification for the CalmHive AI-driven onboarding process.  
Hand this directly to your coding agent for implementation.

**Key Requirements**:

- Conversational chat with exactly 7 questions.
- Skipping **not allowed** on questions 1–6 (only #7 is optional).
- Always **fresh start** — no resume if user leaves mid-flow.
- Strict safety handling with **rule-based critical checks** + **LLM-based severe health detection**.
- After question 7 → redirect to **Terms & Conditions acceptance page**.
- **Weekly plan is generated ONLY after user explicitly agrees to Terms & Conditions**.

## Core Principles

- Lightweight, gentle, non-diagnostic.
- Warm, supportive, patient tone.
- No skipping required questions — gently nudge for input.
- Immediate fixed safety responses for distress or severe health mentions.
- **Rule-based** for critical harm (suicide/self-harm) — **never** use LLM here.
- **LLM-based classification** only for severe mental/physical health conditions.
- **No partial progress saved** — always fresh onboarding session.
- Vector embeddings and plan generation **only after T&C acceptance**.

## 1. Onboarding Questions (Single Source of Truth)

File: `src/onboarding/questions.ts`

```ts
export const ONBOARDING_QUESTIONS = [
  {
    key: "goals",
    text: "What are your main goals for using CalmHive?",
    options: [
      "Reduce daily stress and relax more.",
      "Build better habits and stay productive.",
      "Improve sleep and energy levels.",
    ],
    required: true,
  },
  {
    key: "timeAvailability",
    text: "How much time do you typically have available each day for personal activities?",
    options: [
      "Less than 30 minutes.",
      "30-60 minutes.",
      "More than 60 minutes.",
    ],
    required: true,
  },
  {
    key: "activities",
    text: "What types of activities help you feel more balanced?",
    options: [
      "Physical activities like walking or stretching.",
      "Mindful practices like breathing or reading.",
      "Creative hobbies like journaling or listening to music.",
    ],
    required: true,
  },
  {
    key: "energeticTime",
    text: "On a typical day, when do you feel most energetic?",
    options: [
      "Morning (before noon).",
      "Afternoon (noon to evening).",
      "Evening (after work/school).",
    ],
    required: true,
  },
  {
    key: "anythingElse",
    text: "Is there anything else you'd like to share to personalize your experience? (Totally optional.)",
    options: [],
    required: false,
  },
];
```
````

## 2. Prisma Schema

```prisma
model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique
  name          String?
  onboarded     Boolean   @default(false)
  currentPlan   Json?     // Generated weekly plan (only after T&C)
  onboarding    Onboarding?
  // ... other fields
}

model Onboarding {
  id            Int      @id @default(autoincrement())
  userId        Int      @unique
  responses     Json     // Full responses { goals: "...", ... }
  summaryText   String?  // For embedding
  termsAccepted Boolean  @default(false)
  completedAt   DateTime?
  user          User     @relation(fields: [userId], references: [id])
}
```

Run: `pnpm prisma migrate dev --name final_onboarding_schema`

## 3. LangGraph State Definition

```ts
interface OnboardingState {
  userId: string;
  userName: string;
  step: number; // 0 = greeting, 1 = readiness, 2–6 = questions 1–5, 7 = anything else, 8 = waiting for T&C
  responses: Record<string, string>;
  messages: { role: "assistant" | "user"; content: string }[];
  needsSafetyRedirect: boolean;
}
```

State is **in-memory/session only** — no partial DB persistence.

## 4. LangGraph Nodes (5 Core Nodes)

### Node 1: greetAndCheckReadiness

- Greeting: `Hey ${userName}. Let's start understanding you for a better experience. Are you ready to start?`
- Buttons: "Yes, ready to start" / "No, not ready yet"
- On "No" → "No rush at all! Whenever you're ready, just tap 'Yes'."

### Node 2: askCurrentQuestion

- Uses `ONBOARDING_QUESTIONS[state.step - 1]`
- Shows question + options as buttons
- Note: "You can tap an option (it will appear in the box) and edit it, or type your own."
- For last question: "This one is totally optional — you can skip."

### Node 3: processUserResponse

- **Safety Check #1 — Rule-Based (Critical Distress)**:

  ```ts
  const CRITICAL_TRIGGERS = [/suic/i, /kill myself/i, /self.?harm/i, /crisis/i, /end it all/i];
  if (CRITICAL_TRIGGERS.some(t => t.test(userInput.toLowerCase()))) {
    send CRITICAL_SAFETY_MESSAGE;
    set needsSafetyRedirect = true;
    stay on current step;
  }
  ```

- **Safety Check #2 — LLM-Based (Severe Health Conditions)**:

  - Call Gemini with classification prompt:
    ```ts
    const prompt = `Classify if this mentions severe health issues:
    "${userInput}"
    Only respond with JSON: { hasSevereIssue: true/false, type: "mental"/"physical"/"emergency"/"none" }`;
    ```
  - If `hasSevereIssue === true` → send DOCTOR_CONSULTATION_MESSAGE + stay on step

- If required question & input empty → gentle nudge
- If mildly harmful (e.g., drinking, smoking) → "I'll focus on gentle, positive activities."
- Else → store response, advance step

### Node 4: redirectToTermsAndConditions

- Triggered when step === 8 (after question 7 completed or skipped)
- Final bot message:

  ```
  "Thank you so much for sharing! That's all I need to create your personalized plan. 💚

  One last step: Please review and accept our Terms & Conditions to continue."
  ```

- **End chat flow** → frontend redirects to `/onboarding/terms`

### Node 5: errorHandler

- Fallback for any errors

## 5. Graph Structure

```ts
.addEdge("greetAndCheckReadiness", "askCurrentQuestion")
.addEdge("askCurrentQuestion", "processUserResponse")
.addConditionalEdges("processUserResponse", (state) => {
  if (state.needsSafetyRedirect) return "askCurrentQuestion";
  if (state.step >= 8) return "redirectToTermsAndConditions";
  if (inputInvalid && required) return "askCurrentQuestion";
  return "askCurrentQuestion"; // next question
})
.addEdge("redirectToTermsAndConditions", END)
```

## 6. Terms & Conditions Flow (Separate Page)

- Route: `/onboarding/terms`
- Component: `TermsAndConditionsPage.tsx`
- Displays full T&C text
- Checkbox: "I have read and agree to the Terms & Conditions"
- Button: "Continue" (disabled until checkbox checked)
- On "Continue":
  - API call to `/api/onboarding/complete` (with user auth)
  - Backend triggers **plan generation** (see below)

## 7. Plan Generation — Only After T&C Acceptance

Endpoint: `POST /api/onboarding/complete`

Logic:

1. Verify user has completed questions (check session or temp cache — since no partial save, validate via auth + onboarded false)
2. Fetch responses from session/state (or re-collect if needed — but ideally hold in secure session)
3. Create `Onboarding` record:
   ```ts
   responses: state.responses,
   termsAccepted: true,
   completedAt: new Date()
   ```
4. Generate `summaryText` from all responses
5. Embed `summaryText` → store in vector DB
6. Generate structured weekly plan using Gemini (same prompt/schema as before)
7. Save plan to `User.currentPlan`
8. Set `User.onboarded = true`
9. Redirect to `/dashboard`

**Important**: Plan generation, embedding, and onboarding completion happen **only here** — **never before T&C acceptance**.

## 8. Fixed Safety Messages

**Critical Distress (Rule-Based)**:

```
"I'm really sorry you're feeling this way. CalmHive is only designed to support gentle daily habits and relaxation.
Please reach out to a trusted friend, family member, or professional counselor/doctor right away.
You can continue onboarding whenever you're ready, or come back later."
```

**Severe Health Issue (LLM-Detected)**:

```
"Thank you for sharing. It sounds like you may benefit from professional medical guidance.
CalmHive is designed for light daily habits and relaxation, not medical conditions.
Please consult your doctor or healthcare provider to address these concerns.
We're here to support your wellness journey once you've checked in with a professional. 💚"
```

## 9. Fresh Start Behavior

- If `user.onboarded === false` → always start from greeting
- No "Welcome back" or resume
- All progress lost if user navigates away before T&C

**Final Note**: The personalized weekly plan is generated **only after** the user has completed all questions **and** explicitly agreed to the Terms & Conditions.

```

This is the complete, production-ready spec with your exact requirements. You can now pass this full markdown to your coding agent.
```
