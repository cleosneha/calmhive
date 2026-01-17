"use client";

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

interface HolidaysData {
  week: string;
  holidays: number;
}

interface HolidaysGraphProps {
  data?: HolidaysData[];
  totalHolidaysThisWeek?: number;
  isLoading?: boolean;
}

export function HolidaysGraph({
  data,
  totalHolidaysThisWeek = 0,
  isLoading = false,
}: HolidaysGraphProps) {
  if (isLoading) {
    return (
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle>Holidays Taken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 bg-slate-100 rounded-lg animate-pulse" />
            <div className="h-64 bg-slate-100 rounded-lg animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <NoDataGraph
        title="Holidays Taken"
        description="No historical data available"
        pattern="holidays"
      />
    );
  }

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <CardTitle>Holidays Taken</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-500 mb-2">
          {totalHolidaysThisWeek} holidays taken this week
        </p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
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
              formatter={(value) => `${value} day(s)`}
            />
            <Legend />
            <Bar
              dataKey="holidays"
              fill="#f59e0b"
              name="Days Off"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
