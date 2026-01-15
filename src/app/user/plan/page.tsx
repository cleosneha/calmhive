import { Suspense } from "react";
import { fetchUserPlan } from "@/fetchers/plan";
import PlanClient from "./plan-client";
import NoPlanUI from "./no-plan-ui";
import Loading from "@/app/loading";

async function PlanContent() {
  const res = await fetchUserPlan();

  // Check for errors
  if (res.status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Plan</h1>
        <p className="text-slate-600 mb-8">Manage your weekly plan.</p>

        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-red-600">Error: {res.error}</p>
        </div>
      </div>
    );
  }

  const { plan } = res.data;

  // If no plan exists, show UI to create one
  if (!plan) {
    return <NoPlanUI />;
  }

  return <PlanClient plan={plan} />;
}

export default async function PlanPage() {
  // Layout already handles authentication with requireOnboarding()
  return (
    <Suspense fallback={<Loading />}>
      <PlanContent />
    </Suspense>
  );
}
