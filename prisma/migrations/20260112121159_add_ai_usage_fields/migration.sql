-- AlterTable
ALTER TABLE "user" ADD COLUMN     "aiNoteGenerationCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "firstUpdateNoteCountTime" TIMESTAMP(3);
