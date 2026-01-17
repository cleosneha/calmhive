import { Suspense } from "react";
import { getCurrentUser } from "@/actions/auth";
import InsightsClient from "./client";

export default async function InsightsPage() {
  const user = await getCurrentUser();

  return (
    <Suspense fallback={<InsightsPageSkeleton />}>
      <InsightsClient userId={user!.id} />
    </Suspense>
  );
}

function InsightsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-2 mb-8">
          <div className="h-8 bg-slate-200 rounded-lg animate-pulse w-64" />
          <div className="h-4 bg-slate-200 rounded-lg animate-pulse w-96" />
        </div>

        {/* Filter Skeleton */}
        <div className="h-10 bg-slate-200 rounded-lg animate-pulse w-48 mb-8" />

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Board Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            {/* Metrics Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 bg-slate-200 rounded-lg animate-pulse"
                />
              ))}
            </div>

            {/* Graphs Skeleton */}
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-80 bg-slate-200 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Right Board Skeleton */}
          <div className="h-96 bg-slate-200 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
