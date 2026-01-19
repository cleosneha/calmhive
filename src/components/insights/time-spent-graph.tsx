"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NoDataGraph } from "./no-data-graph";
import { InsightsFilter, PeriodFilter, YearFilter } from "./insights-filter";
import { getFilteredTimeSpentData } from "@/fetchers/insights-filtered";

interface TimeSpentData {
  week: string;
  timeSpent: number;
}

interface TimeSpentGraphProps {
  userId: string;
  initialData?: TimeSpentData[];
  isLoading?: boolean;
}

export function TimeSpentGraph({
  userId,
  initialData,
  isLoading: initialLoading = false,
}: TimeSpentGraphProps) {
  const [data, setData] = useState<TimeSpentData[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(initialLoading);

  const fetchFilteredData = async (
    newPeriod: PeriodFilter,
    newYear: YearFilter,
  ) => {
    setIsLoading(true);
    try {
      const filterType =
        newYear && newYear !== new Date().getFullYear()
          ? "previous-year"
          : newPeriod;

      const filteredData = await getFilteredTimeSpentData(
        userId,
        filterType,
        newYear || undefined,
      );
      setData(filteredData);
    } catch (error) {
      console.error("Error fetching filtered time spent data:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newPeriod: PeriodFilter, newYear: YearFilter) => {
    fetchFilteredData(newPeriod, newYear);
  };

  if (isLoading) {
    return (
      <Card className="bg-white border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Time Spent Trend</CardTitle>
          <div className="h-9 w-[140px] bg-slate-100 rounded-lg animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-slate-100 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="bg-white border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Time Spent Trend</CardTitle>
          <InsightsFilter onFilterChange={handleFilterChange} />
        </CardHeader>
        <CardContent>
          <NoDataGraph
            title=""
            description="Track time invested in tasks"
            pattern="time"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
        <CardTitle>Time Spent Trend</CardTitle>
        <InsightsFilter onFilterChange={handleFilterChange} />
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--ch-sage-light)"
                  stopOpacity={0.95}
                />
                <stop offset="100%" stopColor="#ffffff" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="week"
              stroke="#94a3b8"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
              formatter={(value) => `${value} mins`}
            />
            <Legend />
            <Bar
              dataKey="timeSpent"
              fill="url(#colorTime)"
              name="Time Spent (mins)"
              radius={[8, 8, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
