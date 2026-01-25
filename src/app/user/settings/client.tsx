"use client";

import type { UserProfileData } from "@/fetchers/user-profile";
import { SettingsForm } from "@/components/settings/settings-form";
import { DeleteAccount } from "@/components/settings/delete-account";

interface SettingsFormClientProps {
  initialData: UserProfileData;
}

export function SettingsFormClient({ initialData }: SettingsFormClientProps) {
  return (
    <div className="space-y-8">
      <SettingsForm initialData={initialData} />
      <DeleteAccount />
    </div>
  );
}
