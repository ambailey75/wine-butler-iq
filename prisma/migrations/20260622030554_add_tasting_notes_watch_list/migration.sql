-- CreateTable
CREATE TABLE "tasting_notes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "producer" TEXT NOT NULL,
    "wineName" TEXT NOT NULL,
    "vintage" INTEGER,
    "rating" DECIMAL(4,1),
    "liked" BOOLEAN,
    "notes" TEXT,
    "occasion" TEXT,
    "photoUrl" TEXT,
    "tastedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasting_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watch_list_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "producer" TEXT NOT NULL,
    "wineName" TEXT,
    "vintage" INTEGER,
    "notes" TEXT,
    "targetDate" TIMESTAMP(3),
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watch_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tasting_notes_userId_idx" ON "tasting_notes"("userId");

-- CreateIndex
CREATE INDEX "watch_list_items_userId_idx" ON "watch_list_items"("userId");

-- AddForeignKey
ALTER TABLE "tasting_notes" ADD CONSTRAINT "tasting_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_list_items" ADD CONSTRAINT "watch_list_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
