-- Remove deprecated timeline fields from unit layouts
ALTER TABLE "UnitLayout"
DROP COLUMN "startOfConstruction",
DROP COLUMN "completionOfConstruction",
DROP COLUMN "startOfSales",
DROP COLUMN "endOfSales";
