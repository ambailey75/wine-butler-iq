-- AlterTable
ALTER TABLE "wines" ADD COLUMN     "currentEstValue" DECIMAL(10,2),
ADD COLUMN     "drinkWindowEnd" INTEGER,
ADD COLUMN     "drinkWindowStart" INTEGER,
ADD COLUMN     "pairingNotes" TEXT,
ADD COLUMN     "rating" DECIMAL(4,1),
ADD COLUMN     "style" TEXT,
ADD COLUMN     "tastingNotes" TEXT,
ADD COLUMN     "wineId" TEXT;
