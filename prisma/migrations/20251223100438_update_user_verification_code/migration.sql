/*
  Warnings:

  - You are about to drop the column `verificationCodeExpiresAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "verificationCodeExpiresAt",
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "User_emailVerified_idx" ON "User"("emailVerified");
