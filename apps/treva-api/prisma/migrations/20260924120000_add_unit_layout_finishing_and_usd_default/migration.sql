-- Renovation / furnishing come from Profitbase; null means Profitbase has no data.
ALTER TABLE "UnitLayout" ADD COLUMN "renovation" TEXT;
ALTER TABLE "UnitLayout" ADD COLUMN "furnishing" TEXT;

-- "Rubels" was never a currency the panel offers; the sync now writes the
-- project currency, and new objects default to USD.
ALTER TABLE "Category" ALTER COLUMN "currency" SET DEFAULT 'USD';
UPDATE "Category" SET "currency" = 'USD' WHERE "currency" = 'Rubels';
