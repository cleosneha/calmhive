import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { PlanChatbotState, type PlanChatbotStateType } from "./state";
import {
  greetNode,
  analyzeNode,
  confirmNode,
  executeEditNode,
  respondNode,
  undoNode,
} from "./nodes";

/**
 * Router: Determine entry point
 */
function routeEntry(state: PlanChatbotStateType): string {
  // If no messages or only greeting, start with greet
  if (!state.messages || state.messages.length === 0) {
    return "greet";
  }

  // If undo request
  if (state.isUndoRequest) {
    return "undo";
  }

  // If waiting for confirmation, go to confirm node
  if (state.waitingForConfirmation) {
    return "confirm";
  }

  // If in edit mode (after confirmation), execute the edit
  if (state.mode === "edit" && state.pendingEdit) {
    return "execute_edit";
  }

  // Otherwise, analyze the message
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
  // If user confirmed, execute edit
  if (state.mode === "edit" && state.pendingEdit) {
    return "execute_edit";
  }

  // If user rejected or no pending edit, respond
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
    .addNode("undo", undoNode)

    // Define edges
    .addConditionalEdges(START, routeEntry) // Route to appropriate starting node
    .addEdge("greet", END) // After greet, return to client
    .addConditionalEdges("analyze", routeAfterAnalysis)
    .addConditionalEdges("confirm", routeAfterConfirm)
    .addEdge("execute_edit", "respond")
    .addEdge("respond", END)
    .addEdge("undo", END); // After undo, return to client

  return workflow;
}

/**
 * Compile the plan chatbot graph with MemorySaver (in-memory checkpointer)
 */
export function compilePlanChatbotGraph() {
  const workflow = createPlanChatbotGraph();
  const checkpointer = new MemorySaver();

  return workflow.compile({ checkpointer });
}
