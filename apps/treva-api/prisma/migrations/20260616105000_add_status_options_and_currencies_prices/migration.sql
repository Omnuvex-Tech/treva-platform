DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'Currency'
  ) THEN
    CREATE TABLE "Currency" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'StatusOption'
  ) THEN
    CREATE TABLE "StatusOption" (
        "id" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "StatusOption_pkey" PRIMARY KEY ("id")
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'Currency_name_key'
  ) THEN
    CREATE UNIQUE INDEX "Currency_name_key" ON "Currency"("name");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'Currency_value_key'
  ) THEN
    CREATE UNIQUE INDEX "Currency_value_key" ON "Currency"("value");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'StatusOption_value_key'
  ) THEN
    CREATE UNIQUE INDEX "StatusOption_value_key" ON "StatusOption"("value");
  END IF;
END $$;

ALTER TABLE "UnitLayout"
ADD COLUMN IF NOT EXISTS "prices" JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS "statusOptionId" TEXT;

-- Seed baseline currencies (id format is free-form text; Prisma does not require CUID at the DB level).
INSERT INTO "Currency" ("id", "name", "value", "order", "createdAt", "updatedAt")
VALUES
  ('curr_usd', 'US Dollar', 'USD', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('curr_azn', 'Azerbaijani Manat', 'AZN', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("value") DO NOTHING;

-- Seed baseline status options.
INSERT INTO "StatusOption" ("id", "value", "order", "createdAt", "updatedAt")
VALUES
  ('statusopt_available', 'Available', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('statusopt_sold', 'Sold', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('statusopt_reserved', 'Reserved', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("value") DO NOTHING;

-- Backfill prices from legacy columns if present (these columns exist in older schemas).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'UnitLayout'
      AND column_name IN ('priceUsd', 'priceAzn')
    GROUP BY table_name
    HAVING COUNT(*) = 2
  ) THEN
    UPDATE "UnitLayout"
    SET "prices" = jsonb_strip_nulls(jsonb_build_object('USD', "priceUsd", 'AZN', "priceAzn"))
    WHERE ("prices" = '{}'::jsonb OR "prices" IS NULL)
      AND ("priceUsd" IS NOT NULL OR "priceAzn" IS NOT NULL);
  END IF;
END $$;

-- Backfill statusOptionId from legacy enum status column when available.
UPDATE "UnitLayout"
SET "statusOptionId" = CASE "status"
  WHEN 'available' THEN 'statusopt_available'
  WHEN 'sold' THEN 'statusopt_sold'
  WHEN 'reserved' THEN 'statusopt_reserved'
  ELSE NULL
END
WHERE "statusOptionId" IS NULL;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'UnitLayout_statusOptionId_fkey'
  ) THEN
    ALTER TABLE "UnitLayout"
    ADD CONSTRAINT "UnitLayout_statusOptionId_fkey"
    FOREIGN KEY ("statusOptionId") REFERENCES "StatusOption"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
  END IF;
END $$;
