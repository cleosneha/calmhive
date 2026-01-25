-- AlterTable
ALTER TABLE "user" ADD COLUMN     "recentlyVisitedJournalEntries" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
