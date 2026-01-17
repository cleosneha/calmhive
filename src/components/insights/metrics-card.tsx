import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: ReactNode;
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  trend?: {
    value: number | string;
    direction: "up" | "down" | "neutral";
  };
  className?: string;
}

export function MetricsCard({
  title,
  value,
  subtext,
  icon,
  badge,
  trend,
  className = "",
}: MetricsCardProps) {
  return (
    <Card
      className={`bg-white border-slate-200 hover:shadow-md transition-shadow ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-slate-600">
            {title}
          </CardTitle>
          {icon && (
            <div className="text-xl text-[var(--ch-sage-dark)]">{icon}</div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {trend && (
            <span
              className={`text-sm font-medium ${
                trend.direction === "up"
                  ? "text-green-600"
                  : trend.direction === "down"
                    ? "text-red-600"
                    : "text-slate-500"
              }`}
            >
              {trend.direction === "up"
                ? "↑"
                : trend.direction === "down"
                  ? "↓"
                  : "→"}{" "}
              {trend.value}
            </span>
          )}
        </div>
        {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
        {badge && (
          <Badge variant={badge.variant || "default"}>{badge.label}</Badge>
        )}
      </CardContent>
    </Card>
  );
}
