"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NoDataGraph } from "./no-data-graph";
import { getCompletionData } from "@/actions/insights/filtered-insights";
import type { FilterChangeParams } from "@/types/insights-filter";

interface CompletionTrendData {
  week: string;
  completionRate: number;
}

interface CompletionTrendGraphProps {
  userId: string;
  filterParams: FilterChangeParams;
  initialData?: CompletionTrendData[];
  isLoading?: boolean;
}

export function CompletionTrendGraph({
  userId,
  filterParams,
  initialData,
  isLoading: initialLoading = false,
}: CompletionTrendGraphProps) {
  const [data, setData] = useState<CompletionTrendData[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(initialLoading);

  // Fetch data when filter changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getCompletionData(
          userId,
          filterParams.year,
          filterParams.period,
        );
        setData(response.data || []);
      } catch (error) {
        console.error("Error fetching filtered completion data:", error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, filterParams.year, filterParams.period]);

  if (isLoading) {
    return (
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle>Completion Rate Trend</CardTitle>
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
        <CardHeader>
          <CardTitle>Completion Rate Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <NoDataGraph
            title=""
            description="Track your progress over weeks"
            pattern="trend"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <CardTitle>Completion Rate Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--ch-sage-light)"
                  stopOpacity={0.9}
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
            <YAxis
              stroke="#94a3b8"
              style={{ fontSize: "12px" }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
              formatter={(value) => `${(value as number).toFixed(0)}%`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="completionRate"
              stroke="var(--ch-sage-dark)"
              strokeWidth={2}
              fill="url(#colorCompletion)"
              name="Completion Rate (%)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
