/*
  Warnings:

  - You are about to drop the column `responses` on the `Onboarding` table. All the data in the column will be lost.
  - Added the required column `age` to the `Onboarding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `energeticTime` to the `Onboarding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goalSpecificInfo` to the `Onboarding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goals` to the `Onboarding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeAvailability` to the `Onboarding` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Onboarding" DROP COLUMN "responses",
ADD COLUMN     "activities" TEXT[],
ADD COLUMN     "additionalNotes" TEXT,
ADD COLUMN     "age" INTEGER NOT NULL,
ADD COLUMN     "energeticTime" TEXT NOT NULL,
ADD COLUMN     "goalSpecificInfo" JSONB NOT NULL,
ADD COLUMN     "goals" TEXT NOT NULL,
ADD COLUMN     "timeAvailability" INTEGER NOT NULL;
