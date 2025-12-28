# Onboarding Module Architecture

## Overview

The onboarding system is a modular, type-safe conversational flow that guides new users through a personalized wellness assessment. It uses a two-tier safety system, AI-powered health classification, and generates personalized weekly plans using Google Gemini.

## Architecture Principles

1. **Modular Design**: Separation of concerns with dedicated modules for types, safety, processing, and orchestration
2. **Type Safety**: Comprehensive TypeScript interfaces ensure compile-time safety
3. **Server Actions**: Direct server-side functions instead of API routes for better performance
4. **Stateless Processing**: Pure functions with explicit state management
5. **Two-Tier Safety**: Rule-based immediate checks + LLM-based nuanced classification

## Folder Structure

```
src/
├── ai/
│   └── graphs/
│       └── onboarding/
│           ├── types.ts           # Type definitions
│           ├── safety-checks.ts   # Safety validation logic
│           ├── nodes.ts           # Flow processing functions
│           └── index.ts           # Main orchestration & public API
├── actions/
│   └── onboarding.ts              # Server actions (session management, completion)
├── onboarding/
│   ├── questions.ts               # Questions configuration
│   └── safety-messages.ts         # Safety constants and patterns
└── app/
    └── onboarding/
        ├── chat/
        │   └── page.tsx           # Chat UI component
        └── terms/
            └── page.tsx           # T&C acceptance page
```

## Module Responsibilities

### 1. `types.ts` - Type Definitions

**Purpose**: Central source of truth for all onboarding-related TypeScript types

**Exports**:

- `OnboardingState` - Complete state object for the flow
- `OnboardingMessage` - Chat message structure
- `OnboardingResponse` - API response format
- `SafetyCheckResult` - Safety validation result

**Dependencies**: None (pure types)

### 2. `safety-checks.ts` - Safety Validation

**Purpose**: Modular safety check functions for user message validation

**Functions**:

- `checkCriticalDistress()` - Rule-based regex checks for immediate crisis
- `checkSevereHealthIssues()` - LLM-based classification for severe conditions
- `checkHarmfulPatterns()` - Non-critical but concerning patterns
- `runSafetyChecks()` - Orchestrates all checks sequentially

**Dependencies**:

- `@langchain/google-genai` (ChatGoogleGenerativeAI)
- `@/onboarding/safety-messages` (constants)

**Safety Tiers**:

1. **Critical Distress** (Tier 1) - Immediate, rule-based
   - Keywords: suicide, self-harm, crisis
   - Response: Crisis helpline information
2. **Severe Health** (Tier 2) - LLM-based nuanced classification
   - Detects: Severe mental health conditions, medical emergencies
   - Response: Doctor consultation recommendation
3. **Harmful Patterns** (Tier 3) - Non-critical concerns
   - Detects: Extreme diet, excessive exercise
   - Response: Professional guidance suggestion

### 3. `nodes.ts` - Flow Processing

**Purpose**: Node functions that handle different stages of the onboarding flow

**Functions**:

- `createGreeting(userName)` - Generates initial greeting message
- `processReadinessResponse()` - Handles "Are you ready?" step
- `processQuestionResponse()` - Processes user answers with validation
- `initializeState()` - Creates fresh state object

**Processing Logic**:

1. Add user message to state
2. Run safety checks (if applicable)
3. Validate response (required fields, format)
4. Store response in state
5. Advance to next step
6. Generate next question message
7. Return updated state

**Dependencies**:

- `./types` (TypeScript interfaces)
- `./safety-checks` (validation functions)
- `@/onboarding/questions` (questions config)

### 4. `index.ts` - Orchestration & Public API

**Purpose**: Main entry point that routes user input to appropriate handlers

**Functions**:

- `processUserInput()` - Routes to readiness or question handler
- `createInitialState()` - Wrapper for state initialization
- `stateToResponse()` - Converts state to response format

**Routing Logic**:

```typescript
if (state.step === 0) {
  // Handle readiness check
  return processReadinessResponse(message, state);
} else {
  // Handle question responses
  return processQuestionResponse(message, state);
}
```

**Dependencies**:

- `./nodes` (processing functions)
- `./types` (exported types)

### 5. `actions/onboarding.ts` - Server Actions

**Purpose**: Server-side functions for session management and completion

**Functions**:

#### `startOnboardingSession()`

- Creates initial state with greeting
- Stores in session Map
- Returns messages, step, isComplete

#### `processOnboardingMessage(userMessage)`

- Retrieves current state
- Calls `processUserInput()` from orchestration layer
- Updates session store
- Returns response format

#### `getOnboardingState()`

- Returns current state or null
- Used for page refreshes

#### `getOnboardingResponses()`

- Returns user responses for completion
- Used by T&C page

#### `completeOnboarding()`

- Generates AI summary of responses
- Creates weekly plan with Gemini
- Generates embeddings for preferences
- Saves to database
- Marks user as onboarded
- Clears session

#### `clearOnboardingSession()`

- Deletes session data

**Session Storage**:

- In-memory Map (development)
- Recommended: Redis or database (production)

### 6. `questions.ts` - Configuration

**Purpose**: Single source of truth for onboarding questions

**Structure**:

```typescript
{
  key: string,           // Database field name
  text: string,          // Question text
  options: string[],     // Predefined options (optional)
  required: boolean      // Validation flag
}
```

**Questions**:

1. `goals` - What brings you to CalmHive?
2. `timeAvailability` - Daily time available
3. `activities` - Preferred activities
4. `energeticTime` - Most energetic time of day
5. `anythingElse` - Additional information (optional)

### 7. `safety-messages.ts` - Safety Constants

**Purpose**: Centralized safety messages and trigger patterns

**Exports**:

- `CRITICAL_DISTRESS_MESSAGE` - Crisis helpline info
- `DOCTOR_CONSULTATION_MESSAGE` - Professional help recommendation
- `HARMFUL_REDIRECT_MESSAGE` - Professional guidance suggestion
- `CRITICAL_TRIGGERS` - Regex patterns for immediate crisis
- `HARMFUL_PATTERNS` - Non-critical concern patterns

## Data Flow

### Initialization Flow

```
User lands on /onboarding/chat
  → startOnboardingSession() server action
    → createInitialState() from index.ts
      → initializeState() from nodes.ts
        → Creates state with greeting
          → Returns to UI
```

### Message Processing Flow

```
User sends message
  → processOnboardingMessage(message) server action
    → Get current state from session
      → processUserInput(message, state) from index.ts
        → Route to readiness or question handler
          → Run safety checks (if applicable)
            → Validate and process response
              → Update state
                → Store in session
                  → Return response to UI
```

### Completion Flow

```
User completes all questions
  → Redirect to /onboarding/terms
    → User accepts T&C
      → completeOnboarding() server action
        → Get responses from session
          → Generate AI summary
            → Generate weekly plan with Gemini
              → Create embeddings
                → Save to database
                  → Mark user as onboarded
                    → Clear session
                      → Redirect to /user dashboard
```

## State Management

### OnboardingState Structure

```typescript
{
  userId: string;                    // User identifier
  userName: string;                  // Display name
  step: number;                      // Current step (0 = readiness, 1+ = questions)
  responses: Record<string, string>; // User answers by question key
  messages: Message[];               // Chat history
  needsSafetyRedirect: boolean;      // Safety flag
  isComplete: boolean;               // Flow completion status
}
```

### Session Lifecycle

1. **Creation**: `startOnboardingSession()` creates state with step 0
2. **Updates**: Each message updates state and stores in Map
3. **Persistence**: In-memory Map (production needs Redis)
4. **Cleanup**: `completeOnboarding()` or `clearOnboardingSession()` deletes

## Safety System

### Two-Tier Approach

**Why Two Tiers?**

- Rule-based catches obvious crisis keywords (fast, reliable)
- LLM-based handles nuanced health conditions (context-aware)

**Flow**:

1. Check critical triggers (regex) → Immediate crisis response
2. Check severe health (LLM) → Doctor consultation
3. Check harmful patterns (regex) → Professional guidance
4. All pass → Continue with question processing

**Models Used**:

- Google Gemini (`gemini-2.0-flash-exp`) with temperature=0 for consistency

## AI Components

### Weekly Plan Generation

**Model**: `gemini-2.0-flash-exp` with temperature=0.7 for creativity

**Input**: User responses (goals, time, activities, energy, notes)

**Output**: JSON structure with 7 days, each containing 2-4 tasks

```json
{
  "title": "Your Personalized Weekly Plan",
  "description": "...",
  "days": [
    {
      "day": "Monday",
      "tasks": [
        {
          "title": "Morning breathing exercise",
          "duration": "5 minutes",
          "category": "Mindfulness"
        }
      ]
    }
  ]
}
```

### Onboarding Summary

**Purpose**: Generate concise summary of user preferences

**Input**: Responses object

**Output**: Text summary stored in database

### Embeddings

**Model**: `text-embedding-004` (Google)

**Purpose**: Future semantic search and personalization

**Current Status**: Generated but not yet stored in vector database

**Planned Integration**: Qdrant (dev) / Pinecone (prod)

## Testing Strategy

### Unit Tests (Recommended)

**safety-checks.ts**:

```typescript
test("checkCriticalDistress detects suicide keywords", () => {
  const result = checkCriticalDistress("I want to end it all");
  expect(result.isSafe).toBe(false);
});
```

**nodes.ts**:

```typescript
test("processQuestionResponse stores valid answer", async () => {
  const state = initializeState("user1", "Test");
  state.step = 1;
  const updated = await processQuestionResponse("Be more calm", state);
  expect(updated.responses["goals"]).toBe("Be more calm");
});
```

### Integration Tests

**Full flow test**:

1. Start session
2. Answer "yes" to readiness
3. Answer all 5 questions
4. Verify completion state
5. Call completeOnboarding
6. Verify database records

## Performance Considerations

### LLM Calls

**Current**: 1-2 LLM calls per message (safety checks)

**Optimization**: Cache safety classifications for similar messages

### Session Storage

**Current**: In-memory Map (fast but not persistent)

**Production**:

- Use Redis for distributed systems
- Set TTL for automatic cleanup
- Consider sticky sessions or session replication

### Database

**Writes**: Only on completion (1 insert + 1 update)

**Optimization**: Use transaction for atomic completion

## Error Handling

### User Errors

- Empty required answers → Prompt for input
- Invalid format → Re-ask question
- Safety concerns → Redirect with resources

### System Errors

- LLM timeout → Fall back to rule-based checks
- Database error → Log and show user-friendly message
- Session not found → Redirect to start

### Graceful Degradation

- If LLM safety check fails, continue (log error)
- If embedding generation fails, continue (plan still saved)
- If summary generation fails, use fallback summary

## Future Enhancements

### Vector Store Integration

- Store embeddings in Qdrant/Pinecone
- Enable semantic search for similar users
- Personalized recommendations based on similar profiles

### Advanced Safety

- Sentiment analysis over conversation history
- Risk scoring with escalation thresholds
- Integration with mental health APIs

### Analytics

- Track drop-off rates by question
- Analyze response patterns
- A/B test different question phrasings

### Multi-Language Support

- Internationalize questions and safety messages
- LLM prompts in user's language
- Locale-specific resources

## Deployment Checklist

- [ ] Replace in-memory Map with Redis
- [ ] Configure vector store (Qdrant/Pinecone)
- [ ] Set up monitoring for LLM calls
- [ ] Add rate limiting for server actions
- [ ] Configure proper error tracking
- [ ] Test safety system thoroughly
- [ ] Review and update T&C
- [ ] Set up analytics tracking
- [ ] Load test with concurrent users
- [ ] Verify database indexes

## Maintenance

### Regular Reviews

- Update safety patterns quarterly
- Review LLM prompts for effectiveness
- Analyze user feedback on questions
- Monitor completion rates

### Version Updates

- Document breaking changes
- Maintain backward compatibility for sessions
- Test LLM model upgrades thoroughly

---

**Last Updated**: December 2024  
**Maintainers**: CalmHive Development Team  
**Related Docs**: AGENTS.md, OnboardingFlow.md
