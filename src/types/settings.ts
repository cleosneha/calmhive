/**
 * Settings and User Profile Types
 */

export type TimeOfDay = "morning" | "afternoon" | "evening";

export interface UserSettingsFormData {
  name: string;
  dateOfBirth: Date;
  goals: string;
  timeAvailability: number;
  activities: string;
  energeticTime: TimeOfDay;
  daysOff: string[];
  additionalNotes: string;
}
