/*
  Warnings:

  - You are about to drop the column `age` on the `Onboarding` table. All the data in the column will be lost.
  - Made the column `dateOfBirth` on table `Onboarding` required. This step will fail if there are existing NULL values in that column.

*/

-- Step 1: Convert age to dateOfBirth for existing records where dateOfBirth is NULL
-- This calculates a dateOfBirth based on current age (approximate to January 1st of birth year)
UPDATE "Onboarding" 
SET "dateOfBirth" = MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::int - COALESCE("age", 25), 1, 1)
WHERE "dateOfBirth" IS NULL AND "age" IS NOT NULL;

-- Step 2: For any remaining NULL dateOfBirth values (where age was also NULL), set a default
UPDATE "Onboarding"
SET "dateOfBirth" = MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::int - 25, 1, 1)
WHERE "dateOfBirth" IS NULL;

-- Step 3: Now drop the age column and make dateOfBirth required
ALTER TABLE "Onboarding" DROP COLUMN "age",
ALTER COLUMN "dateOfBirth" SET NOT NULL;
