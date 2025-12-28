-- AlterTable
ALTER TABLE "Onboarding" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "summaryText" TEXT,
ADD COLUMN     "termsAccepted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "currentPlan" JSONB;
