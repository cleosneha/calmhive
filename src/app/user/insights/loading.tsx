"use client";

export default function InsightsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Skeleton */}
        <div className="mb-8 space-y-3">
          <div className="h-10 bg-slate-200 rounded-lg animate-pulse w-72" />
          <div className="h-5 bg-slate-200 rounded-lg animate-pulse w-96" />
        </div>

        {/* Filter Buttons Skeleton */}
        <div className="mb-8 flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse"
            />
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Board: Insights (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key Metrics Section */}
            <div className="space-y-4">
              <div className="h-7 bg-slate-200 rounded-lg animate-pulse w-40" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={`metric-${i}`}
                    className="bg-white border border-slate-200 rounded-lg p-6 space-y-3"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between">
                      <div className="h-4 bg-slate-200 rounded animate-pulse w-24" />
                      <div className="h-6 w-6 bg-slate-200 rounded-full animate-pulse" />
                    </div>

                    {/* Card Value */}
                    <div className="space-y-2">
                      <div className="h-8 bg-slate-200 rounded animate-pulse w-20" />
                      <div className="h-3 bg-slate-200 rounded animate-pulse w-32" />
                    </div>

                    {/* Badge */}
                    <div className="h-6 bg-slate-200 rounded-full animate-pulse w-24" />
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Trends Section */}
            <div className="space-y-4">
              <div className="h-7 bg-slate-200 rounded-lg animate-pulse w-48" />

              {/* Graph Cards */}
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`graph-${i}`}
                    className="bg-white border border-slate-200 rounded-lg overflow-hidden"
                  >
                    {/* Graph Card Header */}
                    <div className="h-16 border-b border-slate-200 px-6 flex items-center">
                      <div className="h-5 bg-slate-200 rounded animate-pulse w-40" />
                    </div>

                    {/* Graph Content */}
                    <div className="p-6">
                      <div className="h-64 bg-slate-100 rounded-lg animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Board: Profile Info (1/3 width) */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 h-fit space-y-6">
            {/* Profile Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-slate-200 rounded-full animate-pulse" />
                <div className="h-5 bg-slate-200 rounded animate-pulse w-24" />
              </div>
            </div>

            {/* User Info Section */}
            <div className="border-b border-slate-200 pb-4 space-y-2">
              <div className="h-4 bg-slate-200 rounded animate-pulse w-16" />
              <div className="h-5 bg-slate-200 rounded animate-pulse w-32" />
              <div className="h-3 bg-slate-200 rounded animate-pulse w-40" />
            </div>

            {/* Streaks Section */}
            <div className="border-b border-slate-200 pb-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-slate-200 rounded-full animate-pulse" />
                <div className="h-4 bg-slate-200 rounded animate-pulse w-20" />
              </div>

              {/* Two Streak Cards */}
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={`streak-${i}`}
                    className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-3 space-y-2"
                  >
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-20" />
                    <div className="h-6 bg-slate-200 rounded animate-pulse w-12" />
                    <div className="h-2 bg-slate-200 rounded animate-pulse w-10" />
                  </div>
                ))}
              </div>
            </div>

            {/* Badges Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-slate-200 rounded-full animate-pulse" />
                <div className="h-4 bg-slate-200 rounded animate-pulse w-24" />
              </div>

              {/* Badge placeholders */}
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`badge-${i}`}
                    className="h-7 bg-slate-200 rounded-full animate-pulse w-28"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Message Skeleton */}
        <div className="text-center py-8">
          <div className="h-4 bg-slate-200 rounded animate-pulse w-48 mx-auto" />
        </div>
      </div>
    </div>
  );
}
