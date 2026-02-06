import { useState, useCallback } from "react";
import { toast } from "sonner";
import { updateUserProfile } from "@/actions/settings/update-profile";
import type { UserProfileData } from "@/fetchers/user-profile";
import { timeFormatToMinutes } from "@/utils/time-parser";

interface UseSettingsFormState {
  name: string;
  dateOfBirth: string;
  goals: string;
  timeAvailability: string;
  activities: string;
  energeticTimeFrom: string;
  energeticTimeTo: string;
  daysOff: string[];
  additionalNotes: string;
}

interface UseSettingsFormReturn {
  formState: UseSettingsFormState;
  setFormState: (state: UseSettingsFormState) => void;
  handleInputChange: (
    field: keyof UseSettingsFormState,
    value: string | string[],
  ) => void;
  handleDaysOffChange: (day: string, checked: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

/**
 * Hook for managing user settings form logic
 */
export function useSettingsForm(
  initialData: UserProfileData,
  onSuccess?: () => void,
): UseSettingsFormReturn {
  const [formState, setFormState] = useState<UseSettingsFormState>({
    name: initialData.name || "",
    dateOfBirth: initialData.onboarding?.dateOfBirth
      ? new Date(initialData.onboarding.dateOfBirth)
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          .replace(/\//g, "/")
      : "",
    goals: initialData.onboarding?.goals || "",
    timeAvailability: initialData.onboarding?.timeAvailability.toString() || "",
    activities: initialData.onboarding?.activities || "",
    energeticTimeFrom:
      initialData.onboarding?.energeticTime?.split("-")[0] || "",
    energeticTimeTo: initialData.onboarding?.energeticTime?.split("-")[1] || "",
    daysOff: initialData.onboarding?.daysOff || [],
    additionalNotes: initialData.onboarding?.additionalNotes || "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = useCallback(
    (field: keyof UseSettingsFormState, value: string | string[]) => {
      setFormState((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  const handleDaysOffChange = useCallback((day: string, checked: boolean) => {
    setFormState((prev) => ({
      ...prev,
      daysOff: checked
        ? [...prev.daysOff, day]
        : prev.daysOff.filter((d) => d !== day),
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        // Validate required fields
        if (!formState.name.trim()) {
          throw new Error("Name is required");
        }
        if (!formState.goals.trim()) {
          throw new Error("Goals are required");
        }
        if (!formState.timeAvailability.trim()) {
          throw new Error("Time availability is required");
        }

        // Parse HH:MM format to minutes
        const timeAvailabilityMinutes = timeFormatToMinutes(
          formState.timeAvailability,
        );
        if (timeAvailabilityMinutes === null) {
          throw new Error("Invalid time format for time availability");
        }
        if (!formState.activities.trim()) {
          throw new Error("Activities are required");
        }
        if (
          !formState.energeticTimeFrom.trim() ||
          !formState.energeticTimeTo.trim()
        ) {
          throw new Error("Energetic time range is required");
        }

        // Client-side validation: name only
        if (!/^[a-zA-Z\s'-]+$/.test(formState.name.trim())) {
          throw new Error(
            "Name should contain only letters, spaces, hyphens, and apostrophes",
          );
        }

        // Validate energetic time duration client-side (30 min - 4 hrs)
        const fromParts = formState.energeticTimeFrom
          .split(":")
          .map((v) => parseInt(v, 10));
        const toParts = formState.energeticTimeTo
          .split(":")
          .map((v) => parseInt(v, 10));
        if (
          fromParts.length !== 2 ||
          toParts.length !== 2 ||
          fromParts.some((n) => isNaN(n)) ||
          toParts.some((n) => isNaN(n))
        ) {
          throw new Error("Invalid time format for energetic time range");
        }

        const fromTotal = fromParts[0] * 60 + fromParts[1];
        const toTotal = toParts[0] * 60 + toParts[1];
        let duration = toTotal - fromTotal;
        if (duration <= 0) duration += 24 * 60;
        if (duration < 30 || duration > 4 * 60) {
          throw new Error(
            "Time range duration must be between 30 minutes and 4 hours",
          );
        }

        const energeticTimeRange = `${formState.energeticTimeFrom}-${formState.energeticTimeTo}`;

        const result = await updateUserProfile({
          name: formState.name.trim(),
          dateOfBirth: formState.dateOfBirth,
          goals: formState.goals.trim(),
          timeAvailability: timeAvailabilityMinutes,
          activities: formState.activities.trim(),
          energeticTime: energeticTimeRange,
          daysOff: formState.daysOff,
          additionalNotes: formState.additionalNotes.trim(),
        });

        if (!result.success) {
          throw new Error(result.message || "Failed to update profile");
        }

        toast.success(result.message || "Profile updated successfully");
        onSuccess?.();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        toast.error(errorMessage);
        console.error("Settings update error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [formState, onSuccess],
  );

  return {
    formState,
    setFormState,
    handleInputChange,
    handleDaysOffChange,
    handleSubmit,
    isLoading,
  };
}
