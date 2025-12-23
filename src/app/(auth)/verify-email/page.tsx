import { Suspense } from "react";
import VerifyEmailClient from "./verify-email-client";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[var(--ch-offwhite)]">
          Loading...
        </div>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}
