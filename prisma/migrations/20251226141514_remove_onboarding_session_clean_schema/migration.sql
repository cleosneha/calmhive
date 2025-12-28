/*
  Warnings:

  - You are about to drop the column `summaryText` on the `Onboarding` table. All the data in the column will be lost.
  - You are about to drop the `onboarding_session` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "onboarding_session" DROP CONSTRAINT "onboarding_session_userId_fkey";

-- AlterTable
ALTER TABLE "Onboarding" DROP COLUMN "summaryText";

-- DropTable
DROP TABLE "onboarding_session";

-- CreateIndex
CREATE INDEX "Onboarding_userId_idx" ON "Onboarding"("userId");
