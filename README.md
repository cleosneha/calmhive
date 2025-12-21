# 🧠 CalmHive — Application Flow

This document describes the end-to-end user flow of the CalmHive application, from first entry to weekly insights.

---

## 1. Landing & Entry

- User lands on the application
- No registration required
- Clear option to:
  - Start onboarding
  - Continue anonymously

Purpose: allow safe, zero-pressure entry.

---

## 2. AI-Driven Onboarding (Pre-Registration)

- Onboarding happens via conversational UI
- User answers a small set of guided questions
- Input methods:
  - Short text
  - Taps
  - Optional voice

Rules:

- Questions are skippable
- No long forms
- No emotional diagnosis

Data Handling:

- All onboarding responses are stored in `localStorage`
- No backend persistence at this stage

---

## 3. Registration Prompt

- After onboarding completion, user is prompted to register
- Registration options:
  - Email + password
  - OAuth (optional)

On registration:

- Onboarding data is sent from `localStorage` to backend
- Data is linked to the user account

---

## 4. Weekly Plan Generation

- AI generates a personalized weekly plan using:
  - Onboarding responses
  - User preferences
  - Available capacity

Plan Characteristics:

- Lightweight daily tasks
- No strict time blocks
- Designed for flexibility

---

## 5. Plan Review & Editing

### Manual Editing

- User can directly edit:
  - Tasks
  - Notes
  - Intensity

### AI-Assisted Editing (Contextual Chatbot)

- Chatbot is available only on the Plan screen
- User can request edits in natural language
- Flow:
  1. User requests change
  2. AI proposes updated plan
  3. User confirms
  4. Plan is updated

AI never edits without confirmation.

---

## 6. Plan Finalization

- Once reviewed, the plan is finalized for the week
- Plan remains stable
- Further changes require explicit user action

---

## 7. Daily Task Updates

- For each task, user can mark:
  - Done
  - Not today
  - Partially done
- Optional short note (manual or AI-assisted)

All task updates are logged daily.

---

## 8. Journaling Flow

### Guided Journaling

- User is shown a small set of soft questions
- User answers via text or voice

### Journal Page Creation

- Answers are converted into an AI-generated journal draft
- Draft is fully editable by the user
- User saves the final journal entry

---

## 9. Journal Signal Processing

- Journal content is processed to extract:
  - Emotional tone
  - Recurring themes
- Raw text is never quoted
- Only aggregated signals are stored

---

## 10. Weekly Insight Generation (Cron Job)

- Weekly background job runs using:
  - Task completion data
  - Journal-derived signals
- Generates:
  - A narrative weekly summary
  - Gentle observations
  - Optional suggestions

---

## 11. Insights Page (In-App)

- Insights are displayed on a dedicated Insights page
- Content mirrors the weekly email but is more reflective
- Includes:
  - Weekly narrative
  - 2–3 gentle patterns
  - Optional reflection prompt

No scores, charts, or comparisons.

---

## 12. Weekly Email Summary

- Weekly insights are sent to the user’s registered email
- Short, supportive, non-judgmental format
- No medical advice or diagnosis

---

## End of Flow

The application continuously cycles through:

- Planning
- Doing
- Reflecting

With minimal user effort and AI handling most of the work.

## Migration Command

- for local development
  pnpm prisma migrate dev --name init
