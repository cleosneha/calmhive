"use client";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import PlanTable from "@/components/plan/plan-table";
import PlanChatbot from "@/components/plan/plan-chatbot";
import { fetchUserPlan } from "@/fetchers/plan";
import { Button } from "@/components/ui/button";

interface Task {
  id: number;
  day: string;
  timeRange: string;
  activity: string;
  status: string;
  notes: string | null;
}

interface Plan {
  id: number;
  userId: string;
  daysOff: string[];
  hoursSummary: Record<string, number> | null;
  hoursSummaryHuman?: Record<string, string> | null;
  createdAt: Date;
  updatedAt: Date;
  tasks: Task[];
}

interface Props {
  plan: Plan;
}

// Status icons and labels removed; only activity name is displayed in table cells.

export default function PlanClient({ plan: initialPlan }: Props) {
  const [plan, setPlan] = useState<Plan>(initialPlan);

  const handleRefresh = async () => {
    try {
      const res = await fetchUserPlan();
      if (res.status === "success" && res.data.plan) {
        setPlan(res.data.plan);
      }
    } catch (error) {
      console.error("Failed to refresh plan:", error);
    }
  };
  // Ref for chatbot section
  const chatbotRef = useRef<HTMLDivElement>(null);

  const handleAskEditPlan = () => {
    if (chatbotRef.current) {
      chatbotRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--ch-sage-dark)] mb-2">
                Your Weekly Plan
              </h1>
              <p className="text-[var(--foreground)]/70">
                Stay on track with your personalized wellness plan
              </p>
            </div>

            <div className="mt-4 sm:mt-0 flex flex-col items-end gap-2">
              {/* Days Off aligned with the subtitle */}
              {plan.daysOff.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--foreground)]/70">
                    Days Off:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {plan.daysOff.map((day) => (
                      <Badge
                        key={day}
                        variant="secondary"
                        className="bg-[var(--ch-sage-dark)]/10"
                      >
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {/* Week total aligned with the heading */}
              {(plan.hoursSummaryHuman?.weekTotal ||
                plan.hoursSummary?.weekTotal != null) && (
                <div className="flex items-center">
                  <Badge
                    variant="secondary"
                    className="bg-[var(--ch-sage-dark)]/10"
                  >
                    Week total:{" "}
                    {plan.hoursSummaryHuman?.weekTotal ??
                      `${plan.hoursSummary?.weekTotal.toFixed(2)} hrs`}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ask/Edit Plan Button */}
        <div className="mb-4 flex justify-end">
          <Button type="button" variant="white" onClick={handleAskEditPlan}>
            Ask/Edit Plan
          </Button>
        </div>

        <div className="shadow-lg overflow-auto rounded-lg border border-slate-200">
          {/* Render PlanTable component */}
          <PlanTable
            plan={plan}
            onEdit={(id) => alert(`Edit task ${id}`)}
            onRefresh={handleRefresh}
          />
        </div>

        {/* Plan Chatbot UI below the table */}
        <div ref={chatbotRef} className="mt-8">
          <PlanChatbot />
        </div>
      </div>
    </div>
  );
}
