"use client";

import React, { useState } from "react";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import type { UserProfileData } from "@/fetchers/user-profile";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldContent,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { FaSpinner, FaPencil, FaX } from "react-icons/fa6";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface SettingsFormProps {
  initialData: UserProfileData;
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const {
    formState,
    handleInputChange,
    handleDaysOffChange,
    handleSubmit,
    isLoading,
  } = useSettingsForm(initialData, () => setIsEditMode(false));

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-6">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            {initialData.image ? (
              <Image
                src={initialData.image}
                alt={initialData.name || "User"}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover border-2 border-[var(--ch-sage-light)]"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--ch-sage-light)] to-[var(--ch-sage)] flex items-center justify-center border-2 border-[var(--ch-sage-light)]">
                <span className="text-2xl font-semibold text-[var(--ch-sage-dark)]">
                  {initialData.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[var(--ch-slate-dark)]">
              {initialData.name || "User"}
            </h2>
            <p className="text-[var(--ch-slate)] mt-1">{initialData.email}</p>
            {initialData.onboarding?.age && (
              <p className="text-sm text-[var(--ch-slate)] mt-1">
                Age: {initialData.onboarding.age}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 space-y-6"
      >
        {/* Form Header with Edit Button */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-[var(--ch-slate-dark)]">
            Settings
          </h2>
          {!isEditMode ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditMode(true)}
              title="Edit profile"
            >
              <FaPencil className="h-5 w-5 text-[var(--ch-sage)]" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditMode(false)}
              title="Cancel editing"
            >
              <FaX className="h-5 w-5 text-red-500" />
            </Button>
          )}
        </div>
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--ch-slate-dark)]">
            Basic Information
          </h3>

          <Field>
            <FieldLabel className="text-[var(--ch-slate-dark)]">
              Name
            </FieldLabel>
            <FieldContent>
              <Input
                placeholder="Your name"
                value={formState.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("name", e.target.value)
                }
                disabled={!isEditMode}
                className="border-[var(--ch-sage-light)]/30 focus:border-[var(--ch-sage)] focus:ring-[var(--ch-sage)] disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel className="text-[var(--ch-slate-dark)]">Age</FieldLabel>
            <FieldContent>
              <Input
                type="number"
                placeholder="Your age"
                value={formState.age}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("age", e.target.value)
                }
                disabled={!isEditMode}
                className="border-[var(--ch-sage-light)]/30 focus:border-[var(--ch-sage)] focus:ring-[var(--ch-sage)] disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
            </FieldContent>
          </Field>
        </div>

        {/* Wellness Goals */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h3 className="text-lg font-semibold text-[var(--ch-slate-dark)]">
            Wellness Profile
          </h3>

          <Field>
            <FieldLabel className="text-[var(--ch-slate-dark)]">
              Goals
            </FieldLabel>
            <FieldDescription className="text-xs text-[var(--ch-slate)] mb-2">
              Describe your wellness objectives and priorities
            </FieldDescription>
            <FieldContent>
              <Textarea
                placeholder="What are your wellness goals?"
                value={formState.goals}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleInputChange("goals", e.target.value)
                }
                disabled={!isEditMode}
                className="border-[var(--ch-sage-light)]/30 focus:border-[var(--ch-sage)] focus:ring-[var(--ch-sage)] disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel className="text-[var(--ch-slate-dark)]">
              Time Availability (hours per day)
            </FieldLabel>
            <FieldDescription className="text-xs text-[var(--ch-slate)] mb-2">
              How many hours per day can you dedicate to wellness activities?
            </FieldDescription>
            <FieldContent>
              <Input
                type="time"
                placeholder="HH:MM"
                value={formState.timeAvailability}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("timeAvailability", e.target.value)
                }
                disabled={!isEditMode}
                className="border-[var(--ch-sage-light)]/30 focus:border-[var(--ch-sage)] focus:ring-[var(--ch-sage)] disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel className="text-[var(--ch-slate-dark)]">
              Preferred Activities
            </FieldLabel>
            <FieldDescription className="text-xs text-[var(--ch-slate)] mb-2">
              List your preferred wellness activities
            </FieldDescription>
            <FieldContent>
              <Textarea
                placeholder="e.g., Yoga, Running, Meditation, Swimming"
                value={formState.activities}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleInputChange("activities", e.target.value)
                }
                disabled={!isEditMode}
                className="border-[var(--ch-sage-light)]/30 focus:border-[var(--ch-sage)] focus:ring-[var(--ch-sage)] disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel className="text-[var(--ch-slate-dark)]">
              Most Energetic Time
            </FieldLabel>
            <FieldDescription className="text-xs text-[var(--ch-slate)] mb-2">
              Enter time range in 24-hour format (e.g., 06:00 to 10:00).
              Duration must be 30 minutes to 4 hours.
            </FieldDescription>
            <FieldContent>
              <div className="flex items-center gap-3">
                <Input
                  type="time"
                  value={formState.energeticTimeFrom || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    isEditMode &&
                    handleInputChange("energeticTimeFrom", e.target.value)
                  }
                  disabled={!isEditMode}
                  className="border-[var(--ch-sage-light)]/30 focus:border-[var(--ch-sage)] focus:ring-[var(--ch-sage)] disabled:bg-slate-50 disabled:cursor-not-allowed flex-1"
                />
                <span className="text-[var(--ch-slate)]">to</span>
                <Input
                  type="time"
                  value={formState.energeticTimeTo || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    isEditMode &&
                    handleInputChange("energeticTimeTo", e.target.value)
                  }
                  disabled={!isEditMode}
                  className="border-[var(--ch-sage-light)]/30 focus:border-[var(--ch-sage)] focus:ring-[var(--ch-sage)] disabled:bg-slate-50 disabled:cursor-not-allowed flex-1"
                />
              </div>
            </FieldContent>
          </Field>
        </div>

        {/* Days Off */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h3 className="text-lg font-semibold text-[var(--ch-slate-dark)]">
            Days Off
          </h3>
          <FieldDescription className="text-[var(--ch-slate)]">
            Select which days you prefer as rest days
          </FieldDescription>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day}`}
                  checked={formState.daysOff.includes(day)}
                  onCheckedChange={(checked: boolean) =>
                    isEditMode && handleDaysOffChange(day, checked)
                  }
                  disabled={!isEditMode}
                  className="border-[var(--ch-sage-light)]/30 checked:bg-[var(--ch-sage)] checked:border-[var(--ch-sage)] disabled:cursor-not-allowed"
                />
                <label
                  htmlFor={`day-${day}`}
                  className={`text-sm font-medium text-[var(--ch-slate-dark)] ${isEditMode ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
                >
                  {day}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <Field>
            <FieldLabel className="text-[var(--ch-slate-dark)]">
              Additional Notes
            </FieldLabel>
            <FieldDescription className="text-xs text-[var(--ch-slate)] mb-2">
              Add any other details that might be helpful
            </FieldDescription>
            <FieldContent>
              <Textarea
                placeholder="Any additional information or preferences..."
                value={formState.additionalNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleInputChange("additionalNotes", e.target.value)
                }
                disabled={!isEditMode}
                className="border-[var(--ch-sage-light)]/30 focus:border-[var(--ch-sage)] focus:ring-[var(--ch-sage)] disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
            </FieldContent>
          </Field>
        </div>

        {/* Submit Button */}
        {isEditMode && (
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <Button
              type="button"
              onClick={() => setIsEditMode(false)}
              variant="outline"
              className="border-[var(--ch-slate-light)] text-[var(--ch-slate-dark)] hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} variant="default">
              {isLoading ? (
                <>
                  <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
