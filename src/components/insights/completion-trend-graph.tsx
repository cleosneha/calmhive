"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NoDataGraph } from "./no-data-graph";

interface CompletionTrendData {
  week: string;
  completionRate: number;
}

interface CompletionTrendGraphProps {
  data?: CompletionTrendData[];
  isLoading?: boolean;
}

export function CompletionTrendGraph({
  data,
  isLoading = false,
}: CompletionTrendGraphProps) {
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
      <NoDataGraph
        title="Completion Rate Trend"
        description="Track your progress over weeks"
        pattern="trend"
      />
    );
  }

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <CardTitle>Completion Rate Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
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
            <Line
              type="monotone"
              dataKey="completionRate"
              stroke="#4d7c6d"
              strokeWidth={2}
              dot={{ fill: "#4d7c6d", r: 4 }}
              activeDot={{ r: 6 }}
              name="Completion Rate (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
