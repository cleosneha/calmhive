"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toggleWeeklyEmailPreference } from "@/actions/settings/receive-email";
import { toast } from "sonner";

interface ReceiveEmailProps {
  currentStopEmail: boolean;
}

export function ReceiveEmail({ currentStopEmail }: ReceiveEmailProps) {
  const [receiveEmails, setReceiveEmails] = useState(!currentStopEmail);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (checked: boolean) => {
    setReceiveEmails(checked);
    startTransition(async () => {
      const result = await toggleWeeklyEmailPreference(checked);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
        // Revert on error
        setReceiveEmails(!checked);
      }
    });
  };

  return (
    <div className="bg-white rounded-lg border p-6 shadow-sm">
      <div className="flex flex-col gap-6 sm:flex-row items-start sm:items-center justify-between">
        <div className="flex items-start gap-3">
          <div>
            <h3 className="text-lg font-semibold text-[var(--ch-slate-dark)]">
              Email Preferences
            </h3>
            <p className="text-sm text-[var(--ch-slate)]">
              Manage your weekly insights email notifications
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Label htmlFor="receive-emails" className="text-sm font-medium">
            Receive weekly emails
          </Label>
          <Switch
            id="receive-emails"
            checked={receiveEmails}
            onCheckedChange={handleToggle}
            disabled={isPending}
          />
        </div>
      </div>
    </div>
  );
}
