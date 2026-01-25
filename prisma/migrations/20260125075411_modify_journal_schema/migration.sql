/*
  Warnings:

  - You are about to drop the column `moodScore` on the `JournalEntry` table. All the data in the column will be lost.
  - Added the required column `title` to the `JournalEntry` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('HAPPY', 'SAD', 'ANGRY', 'CALM', 'EXCITED', 'ANXIOUS', 'NEUTRAL');

-- AlterTable
ALTER TABLE "JournalEntry" DROP COLUMN "moodScore",
ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mood" "Mood",
ADD COLUMN     "pinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "encryptedPin" TEXT;

-- CreateIndex
CREATE INDEX "JournalEntry_userId_pinned_idx" ON "JournalEntry"("userId", "pinned");

-- CreateIndex
CREATE INDEX "JournalEntry_userId_mood_idx" ON "JournalEntry"("userId", "mood");

-- CreateIndex
CREATE INDEX "JournalEntry_userId_title_idx" ON "JournalEntry"("userId", "title");
