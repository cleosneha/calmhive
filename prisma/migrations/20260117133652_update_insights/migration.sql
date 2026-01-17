/*
  Warnings:

  - The values [skipped] on the enum `TaskStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `generatedAt` on the `Insight` table. All the data in the column will be lost.
  - You are about to drop the column `journalFrequency` on the `Insight` table. All the data in the column will be lost.
  - You are about to drop the column `keyPatterns` on the `Insight` table. All the data in the column will be lost.
  - You are about to drop the column `narrativeSummary` on the `Insight` table. All the data in the column will be lost.
  - You are about to drop the column `taskCompletionRate` on the `Insight` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Insight` table. All the data in the column will be lost.
  - You are about to drop the column `currentPlan` on the `user` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TaskStatus_new" AS ENUM ('pending', 'done', 'partial');
ALTER TABLE "public"."task" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "task" ALTER COLUMN "status" TYPE "TaskStatus_new" USING ("status"::text::"TaskStatus_new");
ALTER TYPE "TaskStatus" RENAME TO "TaskStatus_old";
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";
DROP TYPE "public"."TaskStatus_old";
ALTER TABLE "task" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterTable
ALTER TABLE "Insight" DROP COLUMN "generatedAt",
DROP COLUMN "journalFrequency",
DROP COLUMN "keyPatterns",
DROP COLUMN "narrativeSummary",
DROP COLUMN "taskCompletionRate",
DROP COLUMN "title",
ADD COLUMN     "averageTimeSpent" DOUBLE PRECISION,
ADD COLUMN     "completedTasks" INTEGER,
ADD COLUMN     "consistencyScore" DOUBLE PRECISION,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "topPerformingDay" TEXT,
ADD COLUMN     "totalTasks" INTEGER,
ADD COLUMN     "trendingCompletion" DOUBLE PRECISION,
ALTER COLUMN "suggestions" DROP NOT NULL,
ALTER COLUMN "suggestions" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "currentPlan",
ADD COLUMN     "badges" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropEnum
DROP TYPE "PlanStatus";
