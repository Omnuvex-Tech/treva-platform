-- Remove off-plan and resale view option relations entirely.
ALTER TABLE "UnitLayout"
DROP CONSTRAINT IF EXISTS "UnitLayout_viewOptionId_fkey";

DROP INDEX IF EXISTS "UnitLayout_viewOptionId_idx";
DROP INDEX IF EXISTS "Apartment_viewOptionId_idx";

ALTER TABLE "UnitLayout"
DROP COLUMN IF EXISTS "viewOptionId";

ALTER TABLE "Apartment"
DROP COLUMN IF EXISTS "viewOptionIds";

DROP TABLE IF EXISTS "ViewOption";
