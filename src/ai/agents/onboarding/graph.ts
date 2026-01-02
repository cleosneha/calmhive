import { StateGraph, START, END } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { Pool } from "pg";
import { OnboardingState, type OnboardingStateType } from "./state";
import {
  greetNode,
  askQuestionNode,
  processResponseNode,
  markCompleteNode,
  completeNode,
} from "./nodes";

// No-op node for when we just want to display current state
function noopNode(state: OnboardingStateType): OnboardingStateType {
  return state;
}

// Determine entry point based on state
function routeEntry(state: OnboardingStateType): string {
  // If no messages or only AI messages, start with greeting
  const hasUserMessage = state.messages?.some(
    (msg) => msg._getType() === "human"
  );

  if (!hasUserMessage) {
    return "greet";
  }

  // If page is refreshed (state exists but last message was AI asking a question)
  // Don't re-ask the question, just display current state
  const lastMessage = state.messages[state.messages.length - 1];
  const lastMessageIsAI = lastMessage?._getType() === "ai";

  if (lastMessageIsAI && state.step > 0 && !state.isComplete) {
    // The AI asked a question but user hasn't answered yet
    // Just display the current state without adding a new message
    return "noop";
  }

  // If user has sent a message, process it
  return "process_response";
}

/**
 * Router: Determine next node based on state
 */
function routeOnboardingFlow(state: OnboardingStateType): string {
  // If waiting for safety acknowledgment, return END to show message
  if (state.waitingForSafetyAck) {
    return END;
  }

  // If complete, go to completion node
  if (state.isComplete) {
    return "complete";
  }

  // Check if processResponseNode already added a custom follow-up message
  // If so, return END to display it
  const lastMessage = state.messages[state.messages.length - 1];
  const lastMessageIsAI = lastMessage?._getType() === "ai";

  // If the last message is AI, return END to display it
  // This handles both:
  // 1. Error messages for irrelevant responses (step unchanged)
  // 2. Follow-up messages for valid responses (step incremented)
  if (lastMessageIsAI) {
    return END;
  }

  // Otherwise, ask next question (for predefined options)
  return "ask_question";
}

/**
 * Create Onboarding StateGraph
 * This is the main graph definition
 */
export function createOnboardingGraph() {
  const workflow = new StateGraph(OnboardingState)
    // Add nodes
    .addNode("greet", greetNode)
    .addNode("ask_question", askQuestionNode)
    .addNode("process_response", processResponseNode)
    .addNode("mark_complete", markCompleteNode)
    .addNode("complete", completeNode)
    .addNode("noop", noopNode)

    // Define edges
    .addConditionalEdges(START, routeEntry) // Route to greet or process_response
    .addEdge("greet", END) // Greet returns initial state, client displays it
    .addEdge("ask_question", END) // Ask question returns, client displays it
    .addConditionalEdges("process_response", routeOnboardingFlow)
    .addConditionalEdges("mark_complete", (state) =>
      state.isComplete ? "complete" : END
    )
    .addEdge("complete", END)
    .addEdge("noop", END);

  return workflow;
}

/**
 * Create PostgreSQL checkpointer for persistent state
 */
export async function createCheckpointer() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const checkpointer = new PostgresSaver(pool);

  // Setup checkpoint tables (run once)
  await checkpointer.setup();

  return checkpointer;
}

// Compile the onboarding graph with checkpointer
export async function compileOnboardingGraph() {
  const workflow = createOnboardingGraph();
  const checkpointer = await createCheckpointer();

  return workflow.compile({ checkpointer });
}
