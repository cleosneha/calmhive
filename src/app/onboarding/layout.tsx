import type { OnboardingLayoutProps } from "@/types";
import { requireVerifiedEmail } from "@/actions/auth";

export default async function OnboardingLayout({
  children,
}: OnboardingLayoutProps) {
  // Ensure user is logged in and email is verified
  // If already onboarded, individual pages can redirect
  await requireVerifiedEmail();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto">{children}</div>
    </div>
  );
}
