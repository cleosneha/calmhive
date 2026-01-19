-- CreateTable
CREATE TABLE "monthly_insight" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "totalTasks" INTEGER NOT NULL DEFAULT 0,
    "completedTasks" INTEGER NOT NULL DEFAULT 0,
    "partialTasks" INTEGER NOT NULL DEFAULT 0,
    "averageTimeSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "holidaysTaken" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_insight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "monthly_insight_userId_year_idx" ON "monthly_insight"("userId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_insight_userId_year_month_key" ON "monthly_insight"("userId", "year", "month");

-- AddForeignKey
ALTER TABLE "monthly_insight" ADD CONSTRAINT "monthly_insight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
