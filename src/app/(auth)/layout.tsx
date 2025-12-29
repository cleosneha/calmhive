import type { AuthLayoutProps } from "@/types";

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full">{children}</div>
    </div>
  );
}
