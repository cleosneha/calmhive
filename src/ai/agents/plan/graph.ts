import { StateGraph, START, END } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { Pool } from "pg";
import { PlanState, type PlanStateType } from "./state";
import { fetchOnboardingDataNode } from "./nodes/fetch-onboarding-data";
import { generatePlanNode } from "./nodes/generate-plan";
import { validatePlanNode } from "./nodes/validate-plan";

/**
 * Router: Determine next node after fetching data
 */
function routeAfterFetch(state: PlanStateType): string {
  if (state.error) {
    return END;
  }
  return "generate";
}

/**
 * Router: Determine next node after validation
 */
function routeAfterValidation(state: PlanStateType): string {
  // Always end after validation (no retries)
  return END;
}

/**
 * Create Plan Generation StateGraph
 */
export function createPlanGraph() {
  const workflow = new StateGraph(PlanState)
    // Add nodes
    .addNode("fetch", fetchOnboardingDataNode)
    .addNode("generate", generatePlanNode)
    .addNode("validate", validatePlanNode)

    // Define edges
    .addEdge(START, "fetch")
    .addConditionalEdges("fetch", routeAfterFetch)
    .addEdge("generate", "validate")
    .addConditionalEdges("validate", routeAfterValidation);

  return workflow;
}

/**
 * Create PostgreSQL checkpointer for persistent state
 */
export async function createPlanCheckpointer() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const checkpointer = new PostgresSaver(pool);

  // Setup checkpoint tables (already created by onboarding agent)
  await checkpointer.setup();

  return checkpointer;
}

/**
 * Compile the plan graph with checkpointer
 */
export async function compilePlanGraph() {
  const workflow = createPlanGraph();
  const checkpointer = await createPlanCheckpointer();

  return workflow.compile({ checkpointer });
}
