-- CreateTable
CREATE TABLE "holiday" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holiday_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "holiday_userId_idx" ON "holiday"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "holiday_userId_date_key" ON "holiday"("userId", "date");

-- AddForeignKey
ALTER TABLE "holiday" ADD CONSTRAINT "holiday_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
