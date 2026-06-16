-- CreateTable
CREATE TABLE "RoomOption" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViewOption" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ViewOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoomOption_value_key" ON "RoomOption"("value");

-- CreateIndex
CREATE UNIQUE INDEX "ViewOption_value_key" ON "ViewOption"("value");

-- AlterTable
ALTER TABLE "UnitLayout"
ADD COLUMN "roomOptionId" TEXT,
ADD COLUMN "viewOptionId" TEXT;

-- Backfill canonicalized view option values from legacy UnitLayout.view text data.
INSERT INTO "ViewOption" ("id", "value", "order", "createdAt", "updatedAt")
SELECT
    'viewopt_' || md5(lower(btrim("view"))),
    INITCAP(lower(btrim("view"))),
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "UnitLayout"
WHERE "view" IS NOT NULL
  AND btrim("view") <> ''
GROUP BY lower(btrim("view"));

-- Link UnitLayout rows to the backfilled ViewOption records.
UPDATE "UnitLayout" ul
SET "viewOptionId" = 'viewopt_' || md5(lower(btrim(ul."view")))
WHERE ul."view" IS NOT NULL
  AND btrim(ul."view") <> '';

-- AddForeignKey
ALTER TABLE "UnitLayout"
ADD CONSTRAINT "UnitLayout_roomOptionId_fkey"
FOREIGN KEY ("roomOptionId") REFERENCES "RoomOption"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitLayout"
ADD CONSTRAINT "UnitLayout_viewOptionId_fkey"
FOREIGN KEY ("viewOptionId") REFERENCES "ViewOption"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
