"use client";

import type { UserProfileData } from "@/fetchers/user-profile";
import { SettingsForm } from "@/components/settings/settings-form";
import { PrivacyPinSection } from "@/components/settings/privacy-pin-section";
import { DeleteAccount } from "@/components/settings/delete-account";
import { ReceiveEmail } from "@/components/settings/receive-email";

interface SettingsFormClientProps {
  initialData: UserProfileData;
}

export function SettingsFormClient({ initialData }: SettingsFormClientProps) {
  return (
    <div className="space-y-8">
      <SettingsForm initialData={initialData} />
      <ReceiveEmail currentStopEmail={initialData.stopEmail} />
      <PrivacyPinSection />
      <DeleteAccount />
    </div>
  );
}
