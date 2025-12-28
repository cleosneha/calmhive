# CalmHive Onboarding Agent

A proper LangGraph-based conversational agent for onboarding users to CalmHive.

## Architecture

This agent follows LangGraph best practices with:

- **StateGraph**: Persistent state management using PostgreSQL checkpointer
- **Nodes**: Discrete, single-responsibility functions
- **Edges**: Clear control flow and routing
- **Tools**: Modular safety checks and utilities

## Directory Structure

```
src/agents/onboarding/
├── index.ts           # Main exports
├── state.ts           # State definition (OnboardingState)
├── graph.ts           # StateGraph definition and compilation
├── nodes.ts           # Node implementations (greet, ask, process, complete)
└── tools/
    └── safety.ts      # Safety check tools (critical & severe)
```

## State

`OnboardingState` contains:

- `userId`, `userName`: User identification
- `messages`: Full conversation history (managed by MessagesAnnotation)
- `step`: Current question index (0 = readiness, 1-5 = questions)
- `responses`: Collected user answers `{ goals: "...", ... }`
- `isComplete`: Whether all questions are answered
- `needsSafetyRedirect`: Safety flag for distress/health mentions

## Nodes

1. **greetNode**: Initial greeting and readiness check
2. **askQuestionNode**: Presents current question with options
3. **processResponseNode**: Validates input, runs safety checks, stores responses
4. **completeNode**: Final message before T&C redirect

## Edges & Routing

- `START → greet → END`
- `ask_question → END`
- `process_response → (conditional) → ask_question | complete`
- `complete → END`

Routing logic in `routeOnboardingFlow()`:

- If safety triggered → stay on current question
- If complete → go to completion
- Otherwise → ask next question

## Tools

### Safety Checks

- **checkCriticalSafety**: Rule-based keyword detection (suicide, self-harm)
- **checkSevereHealth**: LLM-based classification for medical conditions

Both return structured responses with `isTriggered` and `message`.

## Persistence

State is persisted to PostgreSQL using `PostgresSaver` from `@langchain/langgraph-checkpoint-postgres`. Checkpoints are saved at every super-step, allowing:

- Resume after hot reloads
- Survive page navigations
- Time-travel debugging
- Fault tolerance

## Usage

### Server Actions (`src/actions/onboarding.ts`)

- `startOnboardingSession()`: Initialize new session
- `processOnboardingMessage(msg)`: Process user input
- `getOnboardingState()`: Retrieve current state
- `getOnboardingResponses()`: Get collected responses (for T&C page)
- `completeOnboarding()`: Save to DB after T&C acceptance

### Thread Management

Each user has a unique `thread_id` (their `userId`). State is scoped per thread:

```ts
await graph.invoke(input, {
  configurable: { thread_id: userId },
});
```

## Flow Diagram

```
START
  ↓
greetNode → "Hey! Ready to start?"
  ↓
[User: "Yes"] → processResponseNode
  ↓
askQuestionNode → "What are your goals?"
  ↓
[User answers] → processResponseNode
  ↓
(Safety checks)
  ↓
askQuestionNode → "How much time...?"
  ↓
... (repeat for all questions)
  ↓
completeNode → "Thank you! Please accept T&C"
  ↓
END
```

## Future Enhancements

- Add retry policies for transient failures
- Implement human-in-the-loop with `interrupt()`
- Add streaming for real-time responses
- Store embeddings in Qdrant for semantic search
- Add background job for plan generation post-T&C
