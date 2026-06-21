import llm from "@/ai/config/llm";
import { ChatPromptTemplate } from "@langchain/core/prompts";

interface TaskData {
  day: string;
  activity: string;
  status: string;
  timeRange: string;
}

interface WeeklyData {
  totalTasks: number;
  completedTasks: number;
  partialTasks: number;
  partialTaskActivities: string[];
  consistencyScore: number;
  trendingCompletion: number;
  topPerformingDay: string;
  averageTimeSpent: number;
  tasks: TaskData[];
  onboardingData?: {
    goals: string;
    activities: string;
    timeAvailability: number;
    energeticTime: string;
    daysOff: string[];
  };
  currentPlan?: Array<{
    day: string;
    activity: string;
    timeRange: string;
  }>;
}

interface AIInsightsResponse {
  weeklyFeedback: string;
  planSuggestions: string;
}

/**
 * Generate personalized weekly feedback and new plan suggestions using LLM
 */
export async function generateWeeklySuggestions(
  data: WeeklyData,
): Promise<AIInsightsResponse> {
  try {
    // Build task breakdown by day and status
    const tasksByDay: Record<
      string,
      { done: number; partial: number; pending: number }
    > = {};
    for (const task of data.tasks) {
      if (!tasksByDay[task.day]) {
        tasksByDay[task.day] = { done: 0, partial: 0, pending: 0 };
      }
      if (task.status === "done") tasksByDay[task.day].done++;
      else if (task.status === "partial") tasksByDay[task.day].partial++;
      else tasksByDay[task.day].pending++;
    }

    const dayBreakdown = Object.entries(tasksByDay)
      .map(
        ([day, stats]) =>
          `${day}: ${stats.done} completed, ${stats.partial} partial, ${stats.pending} pending`,
      )
      .join("\n");

    // Format partial tasks for better AI analysis
    const partialTasksDetail =
      data.partialTaskActivities.length > 0
        ? `\n\n**Partially Completed Tasks (needs attention):**\n${data.partialTaskActivities.map((task) => `- ${task}`).join("\n")}`
        : "";

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are CalmHive's wellness coach. Analyze weekly performance and suggest plan improvements.

**Output Format (MUST BE VALID JSON, no markdown blocks):**
{
  "weeklyFeedback": "3 plain sentences of warm acknowledgment",
  "planSuggestions": "3 specific actionable modifications"
}

**For weeklyFeedback (3 plain sentences, NO percentages/stats):**
- Sentence 1: Acknowledge their effort and consistency
- Sentence 2: Note a specific pattern or positive behavior
- Sentence 3: Encouraging forward-looking statement
Format: "Sentence one. Sentence two. Sentence three."

**For planSuggestions (3 specific changes):**
Mix of:
1. NEW activity to add (aligned with goals, not in current plan)
2. MODIFICATION to existing activity (time slot, intensity, or replacement)
3. OPTIMIZATION (better sequencing, timing adjustment, or intensity tweak)

Each suggestion MUST include:
- Exact activity name
- Specific day and time (e.g., "Tuesday 07:00-07:30")
- Clear reason (e.g., "better energy alignment", "complements current goal work")
Format: "- Add/Replace/Move [activity] on [day] [time] because [reason]\n- ..."

Return ONLY valid JSON.`,
      ],
      [
        "user",
        `Analyze performance and suggest plan adjustments:

**This Week:**
- Total Tasks: {totalTasks}
- Completed: {completedTasks}
- Partial: {partialTasks}
- Consistency: {consistencyScore}
- Trend: {trendingCompletion}
- Best Day: {topPerformingDay}
- Avg Time/Task: {averageTimeSpent}h

**Daily Breakdown:**
{dayBreakdown}{partialTasksDetail}

**User Context:**
{onboardingInfo}

**Current Plan:**
{currentPlan}

Provide:
1. Warm weekly feedback (NO numbers/percentages, just plain sentences)
2. 3 specific plan adjustments for next week`,
      ],
    ]);

    const chain = prompt.pipe(llm);

    const onboardingInfo = data.onboardingData
      ? `Goals: ${data.onboardingData.goals}\nActivities: ${data.onboardingData.activities}\nTime Available: ${data.onboardingData.timeAvailability}hrs/day\nEnergetic Time: ${data.onboardingData.energeticTime}\nDays Off: ${data.onboardingData.daysOff.join(", ") || "None"}`
      : "Not provided";

    const currentPlan = data.currentPlan
      ? data.currentPlan
          .map((t) => `- ${t.day}: ${t.activity} (${t.timeRange})`)
          .join("\n")
      : "No current plan";

    const response = await chain.invoke({
      totalTasks: data.totalTasks,
      completedTasks: data.completedTasks,
      partialTasks: data.partialTasks,
      consistencyScore: data.consistencyScore,
      trendingCompletion:
        data.trendingCompletion >= 0
          ? `+${data.trendingCompletion}`
          : data.trendingCompletion,
      topPerformingDay: data.topPerformingDay || "Variable",
      averageTimeSpent: data.averageTimeSpent,
      dayBreakdown,
      partialTasksDetail,
      onboardingInfo,
      currentPlan,
    });

    const content = response.content.toString().trim();

    // Parse JSON response
    try {
      // Remove markdown code blocks if present
      const jsonContent = content.replace(/```json\n?|```\n?/g, "").trim();
      const parsed = JSON.parse(jsonContent) as AIInsightsResponse;
      return parsed;
    } catch (parseError) {
      console.error( "[INSIGHTS] Failed to parse LLM JSON response:", parseError);
      // Return fallback structure
      return {
        weeklyFeedback:
          content.slice(0, 500) ||
          "Great work this week! Keep building on your progress.",
        planSuggestions:
          "Consider adjusting your schedule based on your performance patterns.",
      };
    }
  } catch (error) {
    console.error("[INSIGHTS] Error generating suggestions:", error);
    return {
      weeklyFeedback: `You showed great dedication this week with ${data.completedTasks} tasks completed. Your best performance was on ${data.topPerformingDay || "the week"}. Keep up the momentum and focus on the areas that need attention.`,
      planSuggestions:
        "Consider adding a new activity that aligns with your goals. Adjust the timing of one existing activity to better match your energy levels. Remove or replace any activity that felt less effective this week.",
    };
  }
}
