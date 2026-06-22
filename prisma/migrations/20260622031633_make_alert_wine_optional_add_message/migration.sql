-- AlterTable
ALTER TABLE "cellar_alerts" ADD COLUMN     "message" TEXT,
ALTER COLUMN "wineId" DROP NOT NULL;
