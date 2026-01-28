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
import { getTimeSpentData } from "@/actions/insights/filtered-insights";
import type { FilterChangeParams } from "@/types/insights-filter";

interface TimeSpentData {
  week: string;
  timeSpent: number;
}

interface TimeSpentGraphProps {
  userId: string;
  filterParams: FilterChangeParams;
  initialData?: TimeSpentData[];
  isLoading?: boolean;
}

export function TimeSpentGraph({
  userId,
  filterParams,
  initialData,
  isLoading: initialLoading = false,
}: TimeSpentGraphProps) {
  const [data, setData] = useState<TimeSpentData[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(initialLoading);

  // Fetch data when filter changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getTimeSpentData(
          userId,
          filterParams.year,
          filterParams.period,
        );
        setData(response.data || []);
      } catch (error) {
        console.error("Error fetching filtered time spent data:", error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, filterParams.year, filterParams.period]);

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsSmallScreen(window.innerWidth < 640);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle>Time Spent Trend</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <div
            className={`${isSmallScreen ? "h-48" : "h-64"} bg-slate-100 rounded-lg animate-pulse`}
          />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle>Time Spent Trend</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
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
      <CardHeader>
        <CardTitle>Time Spent Trend</CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <ResponsiveContainer width="100%" height={isSmallScreen ? 200 : 300}>
          <BarChart
            data={data}
            barCategoryGap={isSmallScreen ? "25%" : "16%"}
            barGap={6}
            margin={
              isSmallScreen
                ? { top: 5, right: 10, left: 2, bottom: 5 }
                : { top: 5, right: 30, left: 20, bottom: 5 }
            }
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
              interval={0}
              height={isSmallScreen ? 54 : 30}
              tick={{ fontSize: isSmallScreen ? 10 : 12 }}
              angle={isSmallScreen ? -45 : 0}
              textAnchor={isSmallScreen ? "end" : "middle"}
              tickMargin={isSmallScreen ? 8 : 10}
              padding={isSmallScreen ? { left: 0, right: 0 } : undefined}
            />
            <YAxis
              stroke="#94a3b8"
              width={isSmallScreen ? 28 : 48}
              tick={{ fontSize: isSmallScreen ? 10 : 12 }}
            />
            <Tooltip
              cursor={{ fill: "var(--ch-sage-light)", fillOpacity: 0.3 }}
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
