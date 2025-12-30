import { StateGraph, START, END } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { Pool } from "pg";
import { OnboardingState, type OnboardingStateType } from "./state";
import {
  greetNode,
  reassuranceNode,
  askQuestionNode,
  processResponseNode,
  markCompleteNode,
  completeNode,
} from "./nodes";

/**
 * Router: Determine entry point based on messages
 */
function routeEntry(state: OnboardingStateType): string {
  // If no messages or only AI messages, start with greeting
  const hasUserMessage = state.messages?.some(
    (msg) => msg._getType() === "human"
  );

  if (!hasUserMessage) {
    return "greet";
  }

  // If page is refreshed (state exists but last message was AI asking a question)
  // Re-prompt the same question instead of processing
  const lastMessage = state.messages[state.messages.length - 1];
  const lastMessageIsAI = lastMessage?._getType() === "ai";

  if (lastMessageIsAI && state.step > 0 && !state.isComplete) {
    // The AI asked a question but user hasn't answered yet
    // Re-ask the same question
    return "ask_question";
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

  // If safety redirect is triggered but acknowledged, proceed to next question
  if (state.needsSafetyRedirect && !state.waitingForSafetyAck) {
    return "ask_question";
  }

  // If complete, go to completion node
  if (state.isComplete) {
    return "complete";
  }

  // If last question has been acknowledged, mark as complete
  if (state.lastQuestionAcknowledged) {
    return "mark_complete";
  }

  // If step is still 0 after processing, check if user is ready or not
  if (state.step === 0) {
    // If user just processed a message at step 0, they're not ready
    // Route to reassurance node
    return "reassurance";
  }

  // Check if processResponseNode already added a custom follow-up message
  // If so, return END to display it
  const lastMessage = state.messages[state.messages.length - 1];
  const lastMessageIsAI = lastMessage?._getType() === "ai";

  // If the last message is AI and we just incremented the step,
  // it means processResponseNode generated a custom follow-up
  if (lastMessageIsAI && state.step > 0) {
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
    .addNode("reassurance", reassuranceNode)
    .addNode("ask_question", askQuestionNode)
    .addNode("process_response", processResponseNode)
    .addNode("mark_complete", markCompleteNode)
    .addNode("complete", completeNode)

    // Define edges
    .addConditionalEdges(START, routeEntry) // Route to greet or process_response
    .addEdge("greet", END) // Greet returns initial state, client displays it
    .addEdge("reassurance", END) // Reassurance returns, client displays it
    .addEdge("ask_question", END) // Ask question returns, client displays it
    .addConditionalEdges("process_response", routeOnboardingFlow)
    .addConditionalEdges("mark_complete", (state) =>
      state.isComplete ? "complete" : END
    )
    .addEdge("complete", END);

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

/**
 * Compile the onboarding graph with checkpointer
 */
export async function compileOnboardingGraph() {
  const workflow = createOnboardingGraph();
  const checkpointer = await createCheckpointer();

  return workflow.compile({ checkpointer });
}
