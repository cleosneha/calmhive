# Onboarding Module - Quick Reference

## For Developers

### Adding a New Question

1. **Update `src/onboarding/questions.ts`**:

```typescript
{
  key: "newQuestion",
  text: "Your question text?",
  options: ["Option 1", "Option 2"], // Optional
  required: true, // or false
}
```

2. **Update Database Schema** (if needed):

```prisma
model Onboarding {
  // Add field to store response
  newQuestion String?
}
```

3. **Run Migration**:

```bash
pnpm prisma migrate dev --name add_new_question
```

That's it! The modular system handles the rest automatically.

### Adding a New Safety Pattern

**For immediate crisis keywords**, update `src/onboarding/safety-messages.ts`:

```typescript
export const CRITICAL_TRIGGERS = [/existing patterns/, /your new pattern/i];
```

**For harmful but non-critical patterns**:

```typescript
export const HARMFUL_PATTERNS = [/existing patterns/, /your new pattern/i];
```

The `runSafetyChecks()` function will automatically use the updated patterns.

### Customizing Safety Messages

Edit `src/onboarding/safety-messages.ts`:

```typescript
export const CRITICAL_DISTRESS_MESSAGE = `Your custom message with resources`;
export const DOCTOR_CONSULTATION_MESSAGE = `Your custom recommendation`;
export const HARMFUL_REDIRECT_MESSAGE = `Your custom guidance`;
```

### Modifying the Greeting

Edit `src/ai/graphs/onboarding/nodes.ts`:

```typescript
export function createGreeting(userName: string): string {
  return `Your custom greeting, ${userName}!`;
}
```

### Testing the Flow Locally

```typescript
// Test in development
import { processUserInput, createInitialState } from "@/ai/graphs/onboarding";

const state = createInitialState("test-user", "Test User");
const updated = await processUserInput("yes", state);
console.log(updated);
```

### Accessing Onboarding Data

**Get current session state**:

```typescript
import { getOnboardingState } from "@/actions/onboarding";
const state = await getOnboardingState();
```

**Get user responses**:

```typescript
import { getOnboardingResponses } from "@/actions/onboarding";
const responses = await getOnboardingResponses();
```

**Complete onboarding programmatically**:

```typescript
import { completeOnboarding } from "@/actions/onboarding";
await completeOnboarding();
```

## For Frontend Developers

### Using in React Components

**Start onboarding**:

```tsx
import { startOnboardingSession } from "@/actions/onboarding";

const handleStart = async () => {
  const initial = await startOnboardingSession();
  setMessages(initial.messages);
};
```

**Send message**:

```tsx
import { processOnboardingMessage } from "@/actions/onboarding";

const handleSend = async (message: string) => {
  const result = await processOnboardingMessage(message);

  if (result.needsSafetyRedirect) {
    // Handle safety redirect
  }

  if (result.isComplete) {
    // Redirect to T&C page
    router.push("/onboarding/terms");
  }

  setMessages(result.messages);
};
```

**Complete onboarding** (after T&C acceptance):

```tsx
import { completeOnboarding } from "@/actions/onboarding";

const handleAccept = async () => {
  await completeOnboarding();
  router.push("/user");
};
```

### Response Format

```typescript
{
  messages: Array<{
    role: "assistant" | "user",
    content: string
  }>,
  step: number,                    // 0 = readiness, 1-5 = questions
  isComplete: boolean,             // True when all questions answered
  needsSafetyRedirect: boolean,    // True if safety concern detected
  responses?: Record<string, string>, // User answers
  currentQuestion?: {              // Current question details
    key: string,
    text: string,
    options: string[],
    required: boolean
  }
}
```

## Module Import Paths

```typescript
// Server Actions
import {
  startOnboardingSession,
  processOnboardingMessage,
  getOnboardingState,
  completeOnboarding,
} from "@/actions/onboarding";

// Graph Functions (for custom logic)
import {
  processUserInput,
  createInitialState,
  stateToResponse,
} from "@/ai/graphs/onboarding";

// Safety Checks (if needed separately)
import {
  runSafetyChecks,
  checkCriticalDistress,
} from "@/ai/graphs/onboarding/safety-checks";

// Types
import type {
  OnboardingState,
  OnboardingResponse,
  SafetyCheckResult,
} from "@/ai/graphs/onboarding/types";

// Configuration
import { ONBOARDING_QUESTIONS } from "@/onboarding/questions";
import {
  CRITICAL_DISTRESS_MESSAGE,
  DOCTOR_CONSULTATION_MESSAGE,
} from "@/onboarding/safety-messages";
```

## Common Tasks

### Resetting a User's Onboarding

```typescript
import { clearOnboardingSession } from "@/actions/onboarding";
import db from "@/lib/db";

// Clear session
await clearOnboardingSession();

// Clear from database (if needed)
await db.onboarding.delete({
  where: { userId: "user-id" },
});

await db.user.update({
  where: { id: "user-id" },
  data: { onboarded: false, currentPlan: null },
});
```

### Debugging Safety Checks

```typescript
import { runSafetyChecks } from "@/ai/graphs/onboarding/safety-checks";

const result = await runSafetyChecks("test message");
console.log({
  isSafe: result.isSafe,
  message: result.message,
});
```

### Extracting User Preferences

```typescript
const responses = await getOnboardingResponses();

const goals = responses.goals;
const timeAvailability = responses.timeAvailability;
const activities = responses.activities;
const energeticTime = responses.energeticTime;
const notes = responses.anythingElse;
```

## Environment Variables

Required for onboarding system:

```env
# Google AI
GOOGLE_API_KEY=your_key_here

# Database
DATABASE_URL=your_database_url

# Better Auth
BETTER_AUTH_SECRET=your_secret
BETTER_AUTH_URL=http://localhost:3000
```

## Troubleshooting

### "No active onboarding session" Error

**Cause**: Session expired or not started  
**Fix**: Call `startOnboardingSession()` first

### Safety Check Not Triggering

**Cause**: Pattern doesn't match message  
**Fix**: Test regex pattern separately, adjust as needed

### LLM Classification Taking Too Long

**Cause**: Network latency or model timeout  
**Fix**: Increase timeout, implement fallback logic

### Database Save Failing

**Cause**: Missing required fields or constraint violation  
**Fix**: Check Prisma schema, verify all required fields provided

### Embeddings Generation Failing

**Cause**: API key or network issue  
**Fix**: Verify GOOGLE_API_KEY, check network logs

## Performance Tips

1. **Minimize LLM Calls**: Safety checks only run on question responses, not readiness check
2. **Session Cleanup**: Clear sessions after completion to prevent memory leaks
3. **Database Indexes**: Ensure userId is indexed in Onboarding table
4. **Caching**: Consider caching embeddings model instance

## Security Considerations

1. **Validate User Auth**: All server actions check authentication
2. **Sanitize Inputs**: User messages are not executed, only analyzed
3. **Rate Limiting**: Implement rate limiting on server actions in production
4. **Session Security**: Use Redis with encryption for production sessions
5. **Data Privacy**: User responses contain sensitive health information - handle accordingly

## Migration from Old API Route

If you have old code using `/api/onboarding/complete`:

**Before**:

```tsx
const response = await fetch("/api/onboarding/complete", {
  method: "POST",
});
```

**After**:

```tsx
import { completeOnboarding } from "@/actions/onboarding";
await completeOnboarding();
```

Benefits of server actions:

- No separate API route needed
- Type-safe function calls
- Better error handling
- Direct database access
- Reduced latency

---

**Need Help?** See [ONBOARDING_ARCHITECTURE.md](./ONBOARDING_ARCHITECTURE.md) for detailed architecture documentation.
