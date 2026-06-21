import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";

import { PlanChatbotState, type PlanChatbotStateType } from "./state";
import {
  greetNode,
  analyzeNode,
  confirmNode,
  executeEditNode,
  respondNode,
} from "./nodes";

/**
 * Singleton MemorySaver instance for in-memory state persistence
 * This persists across function calls within the same process
 */
const memorySaver = new MemorySaver();

/**
 * Router: Determine entry point
 */
function routeEntry(state: PlanChatbotStateType): string {
  // If no messages or only greeting, start with greet
  if (!state.messages || state.messages.length === 0) {
    // console.log("[routeEntry] → greet (no messages)");
    return "greet";
  }

  // Check if last message is an action response (confirm/cancel button click)
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage && lastMessage._getType() === "human") {
    const content =
      typeof lastMessage.content === "string"
        ? lastMessage.content.toLowerCase().trim()
        : "";
    if (content.startsWith("action:")) {
      // console.log("[routeEntry] → confirm (action detected:", content, ")");
      return "confirm"; // Route action responses directly to confirm node
    }
  }

  // If waiting for confirmation, go to confirm node
  if (state.waitingForConfirmation) {
    // console.log("[routeEntry] → confirm (waiting for confirmation)");
    return "confirm";
  }

  // If in edit mode (after confirmation), execute the edit
  if (state.mode === "edit" && state.pendingEdit) {
    // console.log("[routeEntry] → execute_edit (edit mode + pending edit)");
    return "execute_edit";
  }

  // Otherwise, analyze the message
  // console.log("[routeEntry] → analyze (default)");
  return "analyze";
}

/**
 * Router: After analysis, decide next step
 */
function routeAfterAnalysis(state: PlanChatbotStateType): string {
  if (state.waitingForConfirmation) {
    return END; // Display confirmation request
  }

  // If it's a query or edit was rejected, respond
  return "respond";
}

/**
 * Router: After confirmation handling
 */
function routeAfterConfirm(state: PlanChatbotStateType): string {
  // console.log("[routeAfterConfirm] Mode:", state.mode);
  // console.log("[routeAfterConfirm] Has pending edit:", !!state.pendingEdit);
  // console.log( "[routeAfterConfirm] Waiting for confirmation:", state.waitingForConfirmation );

  // If user confirmed, execute edit
  if (state.mode === "edit" && state.pendingEdit) {
    // console.log("[routeAfterConfirm] → execute_edit");
    return "execute_edit";
  }

  // If user rejected or no pending edit, respond
  // console.log("[routeAfterConfirm] → respond");
  return "respond";
}

/**
 * Create Plan Chatbot StateGraph
 * This is the main graph definition
 */
export function createPlanChatbotGraph() {
  const workflow = new StateGraph(PlanChatbotState)
    // Add nodes
    .addNode("greet", greetNode)
    .addNode("analyze", analyzeNode)
    .addNode("confirm", confirmNode)
    .addNode("execute_edit", executeEditNode)
    .addNode("respond", respondNode)

    // Define edges
    .addConditionalEdges(START, routeEntry) // Route to appropriate starting node
    .addEdge("greet", END) // After greet, return to client
    .addConditionalEdges("analyze", routeAfterAnalysis)
    .addConditionalEdges("confirm", routeAfterConfirm)
    .addEdge("execute_edit", "respond")
    .addEdge("respond", END);

  return workflow;
}

/**
 * Compile the plan chatbot graph with MemorySaver (in-memory checkpointer)
 * Uses singleton memorySaver to persist state across invocations
 */
export function compilePlanChatbotGraph() {
  const workflow = createPlanChatbotGraph();

  return workflow.compile({ checkpointer: memorySaver });
}
