interface InsightsHeaderProps {
  isLoading?: boolean;
}

export function InsightsHeader({ isLoading = false }: InsightsHeaderProps) {
  if (isLoading) {
    return (
      <div className="mb-8 space-y-2">
        <div className="h-8 bg-slate-100 rounded-lg animate-pulse w-48" />
        <div className="h-4 bg-slate-100 rounded-lg animate-pulse w-96" />
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-slate-900 mb-2">
        Your Weekly Insights
      </h1>
      <p className="text-slate-600">
        Track your progress and stay motivated on your journey
      </p>
    </div>
  );
}

interface MetricFilterProps {
  selectedFilter: "week" | "month" | "year";
  onFilterChange: (filter: "week" | "month" | "year") => void;
  isLoading?: boolean;
}
