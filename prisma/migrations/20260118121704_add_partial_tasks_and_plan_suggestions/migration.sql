-- AlterTable
ALTER TABLE "Insight" ADD COLUMN     "partialTasks" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "planSuggestions" TEXT;
