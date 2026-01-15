import type { AuthLayoutProps } from "@/types";
import { redirectIfAuthenticated } from "@/actions/auth";

export default async function AuthLayout({ children }: AuthLayoutProps) {
  // Redirect authenticated users to appropriate page
  await redirectIfAuthenticated();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full">{children}</div>
    </div>
  );
}
