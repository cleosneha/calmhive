"use client";

export default function ChatSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center p-0 relative">
      <div className="w-full max-w-3xl rounded-t-xl rounded-b-xl shadow-lg p-0 flex flex-col h-[92vh] lg:h-[90vh] bg-white relative z-10">
        {/* Header Skeleton */}
        <div className="px-4 py-3 lg:px-6 lg:py-4 border-b border-[var(--ch-sage-dark)]/10 flex items-center justify-between rounded-t-xl bg-white">
          <div className="text-left flex-1">
            <div className="h-7 lg:h-8 w-48 bg-[var(--ch-sage-dark)]/10 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-64 bg-[var(--ch-sage-dark)]/5 rounded-lg animate-pulse" />
          </div>
          <div className="w-9 h-9 lg:w-12 lg:h-12 rounded-full bg-[var(--ch-sage-light)]/40 animate-pulse ml-4" />
        </div>

        {/* Chat Messages Skeleton */}
        <div className="flex-1 overflow-y-auto px-4 py-3 lg:px-6 lg:py-4 space-y-4 lg:space-y-6 bg-transparent relative flex flex-col">
          <div className="flex flex-col flex-1 space-y-4">
            {/* Assistant Message Skeleton */}
            <div className="flex justify-start mb-4">
              <div className="rounded-2xl px-3 py-2 lg:px-4 lg:py-3 max-w-[85%] lg:max-w-[80%] space-y-2 bg-[var(--ch-sage-light)]/30">
                <div className="h-4 w-40 bg-[var(--ch-sage-light)]/60 rounded-lg animate-pulse" />
                <div className="h-4 w-48 bg-[var(--ch-sage-light)]/60 rounded-lg animate-pulse" />
                <div className="h-4 w-32 bg-[var(--ch-sage-light)]/60 rounded-lg animate-pulse" />
              </div>
            </div>

            {/* User Message Skeleton */}
            <div className="flex justify-end mb-4">
              <div className="rounded-2xl px-3 py-2 lg:px-4 lg:py-3 max-w-[85%] lg:max-w-[80%] bg-white border border-[var(--ch-sage-dark)]/10">
                <div className="h-4 w-32 bg-[var(--ch-sage-dark)]/20 rounded-lg animate-pulse" />
              </div>
            </div>

            {/* Assistant Message Skeleton */}
            <div className="flex justify-start">
              <div className="rounded-2xl px-3 py-2 lg:px-4 lg:py-3 max-w-[85%] lg:max-w-[80%] space-y-2 bg-[var(--ch-sage-light)]/30">
                <div className="h-4 w-44 bg-[var(--ch-sage-light)]/60 rounded-lg animate-pulse" />
                <div className="h-4 w-36 bg-[var(--ch-sage-light)]/60 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>

          {/* Suggestions Skeleton */}
          <div className="flex flex-col gap-2 mt-auto">
            <div className="flex flex-row items-start gap-2">
              <div className="w-4 h-4 bg-[var(--ch-sage-dark)] rounded animate-pulse mt-0.5" />
              <div className="flex flex-col gap-1 flex-1">
                <div className="h-9 bg-[var(--ch-sage-light)]/40 rounded-lg animate-pulse" />
                <div className="h-9 bg-[var(--ch-sage-light)]/40 rounded-lg animate-pulse" />
                <div className="h-9 bg-[var(--ch-sage-light)]/40 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Input Skeleton */}
        <div className="px-4 py-3 lg:px-6 lg:py-4 border-t border-[var(--ch-sage-dark)]/10 bg-white flex gap-2 rounded-b-3xl">
          <div className="flex-1 h-9 lg:h-11 bg-[var(--ch-sage-dark)]/5 rounded-xl animate-pulse border border-[var(--ch-sage-dark)]/10" />
          <div className="w-9 h-9 lg:w-11 lg:h-11 bg-[var(--ch-sage-dark)] rounded-xl animate-pulse opacity-50" />
        </div>
      </div>
    </div>
  );
}
