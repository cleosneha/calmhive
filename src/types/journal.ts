/**
 * Journal-related types for CalmHive
 */

/**
 * Journal entry from database
 */
export interface JournalEntry {
  id: number;
  userId: string;
  date: Date;
  finalContent: string;
  moodScore: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create journal entry input
 */
export interface CreateJournalEntryInput {
  date: Date | string;
  finalContent: string;
  moodScore?: number;
}

/**
 * Update journal entry input
 */
export interface UpdateJournalEntryInput {
  finalContent?: string;
  moodScore?: number;
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
