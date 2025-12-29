import type { OnboardingLayoutProps } from "@/types";

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto">{children}</div>
    </div>
  );
}
