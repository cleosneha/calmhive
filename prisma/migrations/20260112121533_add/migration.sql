/*
  Warnings:

  - You are about to drop the column `firstUpdateNoteCountTime` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "firstUpdateNoteCountTime",
ADD COLUMN     "aiNoteCountResetAt" TIMESTAMP(3);
