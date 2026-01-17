"use client";

import { useState } from "react";
import { MetricsCard } from "@/components/insights/metrics-card";
import { CompletionTrendGraph } from "@/components/insights/completion-trend-graph";
import { TimeSpentGraph } from "@/components/insights/time-spent-graph";
import { HolidaysGraph } from "@/components/insights/holidays-graph";
import { ProfileCard } from "@/components/insights/profile-card";
import { AIFeedback } from "@/components/insights/ai-feedback";
import { InsightsHeader } from "@/components/insights/insights-header";
import {
  FiCheckCircle,
  FiBook,
  FiTrendingUp,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";

interface InsightsClientProps {
  userId: string;
}

export default function InsightsClient({ userId }: InsightsClientProps) {
  const [filterType, setFilterType] = useState<"week" | "month" | "year">(
    "week"
  );

  // TODO: Fetch data based on userId and filterType
  // For now, showing empty state UI

  const mockUser = {
    name: "User Name",
    email: "user@example.com",
    badges: [],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <InsightsHeader />

        {/* Top Section: AI Feedback + Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left: AI Feedback */}
          <div className="lg:col-span-2">
            <AIFeedback />
          </div>

          {/* Right: Profile Card */}
          <div>
            <ProfileCard
              userName={mockUser.name}
              userEmail={mockUser.email}
              badges={mockUser.badges}
            />
          </div>
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
              value="0/0"
              subtext="No tasks yet"
              icon={<FiCheckCircle />}
              badge={{
                label: "This Week",
                variant: "secondary",
              }}
            />

            {/* Journal Entry Frequency Card */}
            <MetricsCard
              title="Journal Entries"
              value="0"
              subtext="Entries this week"
              icon={<FiBook />}
            />

            {/* Consistency Card */}
            <MetricsCard
              title="Consistency Score"
              value="0%"
              subtext="Daily completion rate"
              icon={<FiTrendingUp />}
              badge={{
                label: "Start journaling",
                variant: "outline",
              }}
            />

            {/* Average Time Spent Card */}
            <MetricsCard
              title="Avg. Time Spent"
              value="0 mins"
              subtext="Per completed task"
              icon={<FiClock />}
            />

            {/* Partially Completed Tasks Card */}
            <MetricsCard
              title="In Progress"
              value="0"
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
            <CompletionTrendGraph data={undefined} />

            {/* Time Spent Graph */}
            <TimeSpentGraph data={undefined} />
          </div>

          {/* Holidays Graph - full width below */}
          <HolidaysGraph data={undefined} totalHolidaysThisWeek={0} />
        </div>

        {/* Empty State Message */}
        <div className="text-center py-12 mt-12">
          <p className="text-slate-600">
            💡 Start completing tasks and journaling to see your insights
            flourish
          </p>
        </div>
      </div>
    </div>
  );
}
