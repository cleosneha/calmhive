export interface StreakData {
  streak: number;
  maxStreak: number;
  lastStreakUpdate: Date | null;
}

export interface StreakUpdateInput {
  userId: string;
  taskDate: string;
  newStatus: "pending" | "done" | "partial";
}

export interface StreakUpdateResponse {
  success: boolean;
  message: string;
  data?: {
    streak: number;
    maxStreak: number;
  };
}
