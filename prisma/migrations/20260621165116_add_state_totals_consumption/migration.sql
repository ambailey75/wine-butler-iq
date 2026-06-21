-- AlterTable
ALTER TABLE "wines" ADD COLUMN     "consumedQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isFullyConsumed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "totalCostOverride" DECIMAL(10,2),
ADD COLUMN     "totalValueOverride" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "consumption_logs" (
    "id" TEXT NOT NULL,
    "wineId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "consumedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "occasion" TEXT,
    "notes" TEXT,
    "rating" DECIMAL(4,1),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consumption_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consumption_logs_wineId_idx" ON "consumption_logs"("wineId");

-- CreateIndex
CREATE INDEX "consumption_logs_userId_idx" ON "consumption_logs"("userId");

-- AddForeignKey
ALTER TABLE "consumption_logs" ADD CONSTRAINT "consumption_logs_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "wines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumption_logs" ADD CONSTRAINT "consumption_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
