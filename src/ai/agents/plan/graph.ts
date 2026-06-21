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
  const MAX_RETRIES = 2;

  // If validation passed, end the workflow
  if (state.validation?.isValid) {
    return END;
  }

  // If validation failed and we haven't exceeded retry limit, retry generation
  if (state.retryCount < MAX_RETRIES) {
    // console.log( `♻️ Validation failed. Retrying generation (${state.retryCount + 1}/${MAX_RETRIES})`);
    return "retry_generate";
  }

  // Max retries exceeded, end with failure
  // console.log(`❌ Max retries (${MAX_RETRIES}) exceeded. Ending workflow.`);
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
    // Retry node: increment retry count and regenerate
    .addNode("retry_generate", async (state: PlanStateType) => {
      return {
        retryCount: state.retryCount + 1,
        // Keep validation errors for next generation
      };
    })

    // Define edges
    .addEdge(START, "fetch")
    .addConditionalEdges("fetch", routeAfterFetch)
    .addEdge("generate", "validate")
    .addEdge("retry_generate", "generate") // Retry goes back to generate
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
