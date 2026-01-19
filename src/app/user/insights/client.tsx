"use client";

import { MetricsCard } from "@/components/insights/metrics-card";
import { CompletionTrendGraph } from "@/components/insights/completion-trend-graph";
import { TimeSpentGraph } from "@/components/insights/time-spent-graph";
import { HolidaysGraph } from "@/components/insights/holidays-graph";
import { ProfileCard } from "@/components/insights/profile-card";
import { AIFeedback } from "@/components/insights/ai-feedback";
import { InsightsHeader } from "@/components/insights/insights-header";
import { PlanSuggestionsCard } from "@/components/insights/plan-suggestions-card";
import {
  FiCheckCircle,
  FiBook,
  FiTrendingUp,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";

interface DashboardData {
  currentWeek: {
    totalTasks: number;
    completedTasks: number;
    partialTasks: number;
    pendingTasks: number;
    consistencyScore: number;
    averageTimeSpent: number;
    topPerformingDay: string;
    suggestions: string | null;
    planSuggestions: string | null;
  } | null;
  trendData: Array<{
    week: string;
    completionRate: number;
    timeSpent: number;
    holidays: number;
  }>;
  holidaysThisWeek: number;
  journal: {
    entriesThisWeek: number;
    totalEntries: number;
  };
  profile: {
    name: string | null;
    email: string;
    badges: string[];
  } | null;
}

interface InsightsClientProps {
  dashboardData: DashboardData;
  userId: string;
}

export default function InsightsClient({
  dashboardData,
  userId,
}: InsightsClientProps) {
  const { currentWeek, trendData, holidaysThisWeek, journal, profile } =
    dashboardData;

  // Format completion rate
  const completionPercentage = currentWeek
    ? Math.round((currentWeek.completedTasks / currentWeek.totalTasks) * 100) ||
      0
    : 0;

  // Format average time in minutes
  const avgTimeMinutes = currentWeek
    ? Math.round(currentWeek.averageTimeSpent * 60)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <InsightsHeader />

        {/* Top Section: AI Feedback + Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left: AI Feedback */}
          <div className="lg:col-span-2">
            <AIFeedback
              suggestion={currentWeek?.suggestions}
              weekData={currentWeek}
            />
          </div>

          {/* Right: Profile Card */}
          <div>
            <ProfileCard
              userName={profile?.name || "User"}
              userEmail={profile?.email || ""}
              badges={profile?.badges || []}
            />
          </div>
        </div>

        {/* New Plan Suggestions Section */}
        <div className="mb-8">
          <PlanSuggestionsCard
            planSuggestions={currentWeek?.planSuggestions || null}
          />
        </div>

        {/* Metrics Cards Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Key Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Task Completion Card */}
            <MetricsCard
              title="Task Completion"
              value={
                currentWeek
                  ? `${currentWeek.completedTasks}/${currentWeek.totalTasks}`
                  : "0/0"
              }
              subtext={
                currentWeek
                  ? `${completionPercentage}% completed`
                  : "No tasks yet"
              }
              icon={<FiCheckCircle />}
              badge={{
                label: "This Week",
                variant: "secondary",
              }}
            />

            {/* Journal Entry Frequency Card */}
            <MetricsCard
              title="Journal Entries"
              value={journal.entriesThisWeek.toString()}
              subtext={`${journal.totalEntries} total entries`}
              icon={<FiBook />}
            />

            {/* Consistency Card */}
            <MetricsCard
              title="Consistency Score"
              value={
                currentWeek
                  ? `${Math.round(currentWeek.consistencyScore)}%`
                  : "0%"
              }
              subtext="Weekly completion rate"
              icon={<FiTrendingUp />}
              badge={
                currentWeek && currentWeek.consistencyScore >= 80
                  ? {
                      label: "Excellent!",
                      variant: "default",
                    }
                  : undefined
              }
            />

            {/* Average Time Spent Card */}
            <MetricsCard
              title="Avg. Time Spent"
              value={avgTimeMinutes > 0 ? `${avgTimeMinutes} mins` : "0 mins"}
              subtext="Per completed task"
              icon={<FiClock />}
            />

            {/* Partially Completed Tasks Card */}
            <MetricsCard
              title="In Progress"
              value={currentWeek?.partialTasks.toString() || "0"}
              subtext="Tasks partially done"
              icon={<FiAlertCircle />}
            />
          </div>
        </div>

        {/* Graphs Section */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Performance Trends
          </h2>

          {/* Two-column grid for main graphs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Completion Trend Graph */}
            <CompletionTrendGraph
              userId={userId}
              initialData={trendData.map((d) => ({
                week: d.week,
                completionRate: d.completionRate,
              }))}
            />

            {/* Time Spent Graph */}
            <TimeSpentGraph
              userId={userId}
              initialData={trendData.map((d) => ({
                week: d.week,
                timeSpent: d.timeSpent,
              }))}
            />
          </div>

          {/* Holidays Graph - full width below */}
          <HolidaysGraph
            userId={userId}
            initialData={trendData.map((d) => ({
              week: d.week,
              holidays: d.holidays,
            }))}
            totalHolidaysThisWeek={holidaysThisWeek}
          />
        </div>

        {/* Empty State Message (only show if no data) */}
        {!currentWeek && (
          <div className="text-center py-12 mt-12">
            <p className="text-slate-600">
              💡 Start completing tasks and journaling to see your insights
              flourish
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
