-- AlterTable
ALTER TABLE "imports" ADD COLUMN     "historicalConsumedDate" TIMESTAMP(3),
ADD COLUMN     "isHistoricalImport" BOOLEAN NOT NULL DEFAULT false;
