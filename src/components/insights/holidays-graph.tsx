"use client";

import { useState, useEffect } from "react";
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
import { getHolidaysData } from "@/actions/insights/filtered-insights";
import type { FilterChangeParams } from "@/types/insights-filter";

interface HolidaysData {
  week: string;
  holidays: number;
}

interface HolidaysGraphProps {
  userId: string;
  filterParams: FilterChangeParams;
  initialData?: HolidaysData[];
  totalHolidaysThisWeek?: number;
  isLoading?: boolean;
}

export function HolidaysGraph({
  userId,
  filterParams,
  initialData,
  totalHolidaysThisWeek = 0,
  isLoading: initialLoading = false,
}: HolidaysGraphProps) {
  const [data, setData] = useState<HolidaysData[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(initialLoading);

  // Fetch data when filter changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getHolidaysData(
          userId,
          filterParams.year,
          filterParams.period,
        );
        setData(response.data || []);
      } catch (error) {
        console.error("Error fetching filtered holidays data:", error);
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
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle>Holidays Taken</CardTitle>
        </CardHeader>
        <CardContent>
          <NoDataGraph
            title=""
            description="No historical data available"
            pattern="holidays"
          />
        </CardContent>
      </Card>
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
            <defs>
              <linearGradient id="colorHolidays" x1="0" y1="0" x2="0" y2="1">
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
              formatter={(value) => `${value} day(s)`}
            />
            <Legend />
            <Bar
              dataKey="holidays"
              fill="url(#colorHolidays)"
              name="Days Off"
              radius={[8, 8, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
