import { Suspense } from "react";
import { getCurrentUser } from "@/actions/auth";
import { fetchUserPlan } from "@/fetchers/plan";
import PlanClient from "./plan-client";
import NoPlanUI from "./no-plan-ui";
import Loading from "@/app/loading";

async function PlanContent({ userId }: { userId: string }) {
  const res = await fetchUserPlan(userId);

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

  return <PlanClient plan={plan} userId={userId} />;
}

export default async function PlanPage() {
  // Get the authenticated user (layout already checked requireOnboarding)
  const user = await getCurrentUser();

  return (
    <Suspense fallback={<Loading />}>
      <PlanContent userId={user!.id} />
    </Suspense>
  );
}
