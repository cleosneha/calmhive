import { Suspense } from "react";
import { getOnboardingResponses } from "@/actions/onboarding/onboarding";
import OnboardingCompleteClient from "./complete-client";
import Loading from "@/app/loading";

export default async function OnboardingCompletePage() {
  // Server fetch - type-safe
  const data = await getOnboardingResponses();
  const responses = data.responses;

  return (
    <Suspense fallback={<Loading />}>
      <OnboardingCompleteClient responses={responses} />
    </Suspense>
  );
}
