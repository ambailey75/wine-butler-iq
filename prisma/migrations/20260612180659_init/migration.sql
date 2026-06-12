-- CreateEnum
CREATE TYPE "ImportSourceType" AS ENUM ('EXCEL', 'CSV', 'PDF', 'IMAGE');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('PENDING', 'PROCESSING', 'REVIEW', 'COMPLETE', 'FAILED');

-- CreateEnum
CREATE TYPE "ImportRowStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SKIPPED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "supabaseId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wines" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "producer" TEXT NOT NULL,
    "wineName" TEXT NOT NULL,
    "vintage" INTEGER,
    "country" TEXT,
    "region" TEXT,
    "subRegion" TEXT,
    "classification" TEXT,
    "varietal" TEXT,
    "format" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "purchasePrice" DECIMAL(10,2),
    "purchaseDate" TIMESTAMP(3),
    "vendor" TEXT,
    "storageLocation" TEXT,
    "notes" TEXT,
    "labelPhotoUrl" TEXT,
    "importId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wine_enrichments" (
    "id" TEXT NOT NULL,
    "wineId" TEXT NOT NULL,
    "criticScores" JSONB,
    "currentMarketPrice" DECIMAL(10,2),
    "drinkWindowStart" INTEGER,
    "drinkWindowEnd" INTEGER,
    "peakWindowStart" INTEGER,
    "peakWindowEnd" INTEGER,
    "lastEnrichedAt" TIMESTAMP(3),

    CONSTRAINT "wine_enrichments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cellar_alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wineId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "triggerDate" TIMESTAMP(3) NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cellar_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceType" "ImportSourceType" NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "status" "ImportStatus" NOT NULL DEFAULT 'PENDING',
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "skippedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "imports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_rows" (
    "id" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "rawData" JSONB NOT NULL,
    "mappedData" JSONB,
    "confidenceScores" JSONB,
    "status" "ImportRowStatus" NOT NULL DEFAULT 'PENDING',
    "wineId" TEXT,
    "reviewNotes" TEXT,

    CONSTRAINT "import_rows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_supabaseId_key" ON "users"("supabaseId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "wines_userId_idx" ON "wines"("userId");

-- CreateIndex
CREATE INDEX "wines_importId_idx" ON "wines"("importId");

-- CreateIndex
CREATE UNIQUE INDEX "wine_enrichments_wineId_key" ON "wine_enrichments"("wineId");

-- CreateIndex
CREATE INDEX "cellar_alerts_userId_idx" ON "cellar_alerts"("userId");

-- CreateIndex
CREATE INDEX "cellar_alerts_wineId_idx" ON "cellar_alerts"("wineId");

-- CreateIndex
CREATE INDEX "ai_conversations_userId_idx" ON "ai_conversations"("userId");

-- CreateIndex
CREATE INDEX "imports_userId_idx" ON "imports"("userId");

-- CreateIndex
CREATE INDEX "import_rows_importId_idx" ON "import_rows"("importId");

-- CreateIndex
CREATE INDEX "import_rows_wineId_idx" ON "import_rows"("wineId");

-- AddForeignKey
ALTER TABLE "wines" ADD CONSTRAINT "wines_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wines" ADD CONSTRAINT "wines_importId_fkey" FOREIGN KEY ("importId") REFERENCES "imports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wine_enrichments" ADD CONSTRAINT "wine_enrichments_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "wines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cellar_alerts" ADD CONSTRAINT "cellar_alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cellar_alerts" ADD CONSTRAINT "cellar_alerts_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "wines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imports" ADD CONSTRAINT "imports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_rows" ADD CONSTRAINT "import_rows_importId_fkey" FOREIGN KEY ("importId") REFERENCES "imports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_rows" ADD CONSTRAINT "import_rows_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "wines"("id") ON DELETE SET NULL ON UPDATE CASCADE;
