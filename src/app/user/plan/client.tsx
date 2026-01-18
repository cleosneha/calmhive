"use client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import PlanTable from "@/components/plan/plan-table";
import PlanTableMobile from "@/components/plan/plan-table-mobile";
import PlanChatbot from "@/components/plan/plan-chatbot";
import AddTaskDialog from "@/components/plan/add-task";
import { usePlanData } from "@/hooks/use-plan-data";
import { Button } from "@/components/ui/button";
import { BsStars } from "react-icons/bs";
import { FiX } from "react-icons/fi";
import { MdAdd } from "react-icons/md";

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
  holidays: Array<{
    id: number;
    date: Date;
    reason: string | null;
  }>;
}

interface Props {
  plan: Plan;
  userId: string;
}

// Status icons and labels removed; only activity name is displayed in table cells.

export default function PlanClient({ plan: initialPlan, userId }: Props) {
  const { plan, refreshPlan, isRefreshing } = usePlanData(initialPlan);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Manage body overflow when modal opens
  useEffect(() => {
    if (isChatbotOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isChatbotOpen]);

  const handleRefresh = async () => {
    await refreshPlan();
  };

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
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

              {/* Add Task Button (desktop, top-right) */}
              <div className="mt-2 hidden md:block">
                <Button
                  onClick={() => setIsAddTaskOpen(true)}
                  variant="outline"
                  className="gap-2"
                >
                  <MdAdd className="w-4 h-4" />
                  Add Task
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="shadow-lg overflow-auto rounded-lg border border-slate-200 hidden md:block">
          {/* Desktop Plan Table */}
          <PlanTable
            plan={plan}
            onEdit={(id) => alert(`Edit task ${id}`)}
            onRefresh={handleRefresh}
          />
        </div>

        {/* Mobile Plan Table */}
        <div className="md:hidden">
          <PlanTableMobile
            plan={plan}
            onEdit={(id) => alert(`Edit task ${id}`)}
            onRefresh={handleRefresh}
          />
        </div>
      </div>

      {/* Floating AI Icon Button */}
      <div className="fixed bottom-8 right-8">
        <div className="relative">
          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute bottom-full right-0 mb-3 bg-[var(--ch-sage-dark)] text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg z-40">
              Ask/Edit with AI
              <div className="absolute top-full right-2 w-2 h-2 bg-[var(--ch-sage-dark)] transform rotate-45"></div>
            </div>
          )}

          {/* Circular AI Button */}
          <Button
            onClick={() => setIsChatbotOpen(true)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="w-14 h-14 rounded-full bg-[var(--ch-sage-dark)] text-white shadow-lg hover:bg-[var(--ch-sage-dark)]/90 transition-all hover:scale-110 flex items-center justify-center"
            aria-label="Open AI Chatbot"
            size="icon"
          >
            <BsStars className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Chatbot Popup Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
          isChatbotOpen ? "block" : "hidden"
        }`}
      >
        {/* Backdrop with blur */}
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsChatbotOpen(false)}
        ></div>

        {/* Modal centered on screen */}
        <div className="relative w-full sm:w-140 h-[90vh] max-h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col z-50 overflow-hidden">
          {/* Close Button */}
          <Button
            onClick={() => setIsChatbotOpen(false)}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition z-10"
            aria-label="Close chatbot"
          >
            <FiX className="w-5 h-5" />
          </Button>

          {/* Chatbot Component */}
          <div className="flex-1 min-h-0">
            <PlanChatbot onPlanUpdate={handleRefresh} />
          </div>
        </div>
      </div>

      {/* Add Task Dialog */}
      <AddTaskDialog
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        onTaskAdded={handleRefresh}
      />
    </div>
  );
}
