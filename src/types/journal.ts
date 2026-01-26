/**
 * Journal-related types for CalmHive
 */

export type Mood =
  | "HAPPY"
  | "SAD"
  | "ANGRY"
  | "CALM"
  | "EXCITED"
  | "ANXIOUS"
  | "TIRED"
  | "NEUTRAL";

/**
 * Journal entry from database
 */
export interface JournalEntry {
  id: number;
  userId: string;
  date: Date;
  finalContent: string;
  mood?: Mood;
  pinned: boolean;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create journal entry input
 */
export interface CreateJournalEntryInput {
  date: Date | string;
  finalContent: string;
  mood?: Mood;
  pinned?: boolean;
  isPrivate?: boolean;
}

/**
 * Update journal entry input
 */
export interface UpdateJournalEntryInput {
  finalContent?: string;
  mood?: Mood;
  pinned?: boolean;
  isPrivate?: boolean;
}

/**
 * Journal entry with user data
 */
export interface JournalEntryWithUser extends JournalEntry {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}
