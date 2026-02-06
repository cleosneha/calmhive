import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import db from "@/lib/db";
import OnboardingChatClient from "./chat-client";

export default async function OnboardingChatPage() {
  // Check if user is authenticated
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Check if user already has onboarding responses (completed onboarding)
  try {
    const onboarding = await db.onboarding.findUnique({
      where: { userId: user.id },
    });

    if (onboarding) {
      // User already completed onboarding, redirect to complete page
      redirect("/onboarding/complete");
    }
  } catch {
    // If error checking onboarding, continue to chat
  }

  // Render client component
  return <OnboardingChatClient />;
}
