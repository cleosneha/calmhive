import { fetchUserProfile } from "@/fetchers/user-profile";
import { SettingsFormClient } from "@/app/user/settings/client";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your profile and preferences",
};

/**
 * Server Component: Settings Page
 * Fetches user data on server and passes to client component
 */
export default async function SettingsPage() {
  // Fetch user profile on server
  const userProfile = await fetchUserProfile();

  if (!userProfile) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--ch-bg-light)] to-[var(--ch-bg)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--ch-slate-dark)] mb-2">
            Settings
          </h1>
          <p className="text-[var(--ch-slate)]">
            Manage your profile and wellness preferences
          </p>
        </div>

        {/* Client Component with User Data */}
        <SettingsFormClient initialData={userProfile} />
      </div>
    </div>
  );
}
