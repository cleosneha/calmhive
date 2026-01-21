/**
 * Settings and User Profile Types
 */

export type TimeOfDay = "morning" | "afternoon" | "evening";

export interface UserSettingsFormData {
  name: string;
  age: number;
  goals: string;
  timeAvailability: number;
  activities: string;
  energeticTime: TimeOfDay;
  daysOff: string[];
  additionalNotes: string;
}
