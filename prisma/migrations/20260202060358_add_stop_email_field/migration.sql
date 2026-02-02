-- AlterEnum
ALTER TYPE "Mood" ADD VALUE 'TIRED';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "stopEmail" BOOLEAN NOT NULL DEFAULT false;
