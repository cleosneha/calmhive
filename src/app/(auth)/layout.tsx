import type { AuthLayoutProps } from "@/types";
import { getAuthState } from "@/actions/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const { isLoggedIn, isVerified, isOnboarded } = await getAuthState();
  if (isLoggedIn && isVerified) {
    if (isOnboarded) {
      redirect("/user");
    } else {
      redirect("/onboarding");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full">{children}</div>
    </div>
  );
}
