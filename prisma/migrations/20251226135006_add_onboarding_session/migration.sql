-- CreateTable
CREATE TABLE "onboarding_session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_session_userId_key" ON "onboarding_session"("userId");

-- CreateIndex
CREATE INDEX "onboarding_session_userId_idx" ON "onboarding_session"("userId");

-- AddForeignKey
ALTER TABLE "onboarding_session" ADD CONSTRAINT "onboarding_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
