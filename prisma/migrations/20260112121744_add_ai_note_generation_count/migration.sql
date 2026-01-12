/*
  Warnings:

  - You are about to drop the column `aiNoteCountResetAt` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "aiNoteCountResetAt",
ADD COLUMN     "aiNoteGenerationCountResetAt" TIMESTAMP(3);
