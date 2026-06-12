-- CreateTable
CREATE TABLE "Currency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Currency_name_key" ON "Currency"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_value_key" ON "Currency"("value");

-- AlterTable: Add prices column with default empty JSON
ALTER TABLE "UnitLayout" ADD COLUMN "prices" JSONB NOT NULL DEFAULT '{}';

-- Update existing rows: Migrate priceUsd and priceAzn to prices JSON
UPDATE "UnitLayout" SET "prices" = jsonb_build_object('USD', "priceUsd", 'AZN', "priceAzn");

-- AlterTable: Drop old price columns
ALTER TABLE "UnitLayout" DROP COLUMN "priceUsd";
ALTER TABLE "UnitLayout" DROP COLUMN "priceAzn";

-- Insert default currencies
INSERT INTO "Currency" ("id", "name", "value", "order", "createdAt", "updatedAt")
VALUES
  ('clt_usd_seed', 'US Dollar', 'USD', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('clt_azn_seed', 'Azerbaijani Manat', 'AZN', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('clt_eur_seed', 'Euro', 'EUR', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("value") DO NOTHING;
