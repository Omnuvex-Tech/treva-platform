-- Move resale apartment view/heating selections from single-value FKs to string arrays.
ALTER TABLE "Apartment"
ADD COLUMN "heatingTypeIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "viewOptionIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "Apartment"
SET "heatingTypeIds" = ARRAY["heatingTypeId"]
WHERE "heatingTypeId" IS NOT NULL;

UPDATE "Apartment"
SET "viewOptionIds" = ARRAY["viewOptionId"]
WHERE "viewOptionId" IS NOT NULL;

ALTER TABLE "Apartment"
DROP CONSTRAINT IF EXISTS "Apartment_heatingTypeId_fkey",
DROP CONSTRAINT IF EXISTS "Apartment_viewOptionId_fkey";

DROP INDEX IF EXISTS "Apartment_heatingTypeId_idx";
DROP INDEX IF EXISTS "Apartment_viewOptionId_idx";

ALTER TABLE "Apartment"
DROP COLUMN IF EXISTS "heatingTypeId",
DROP COLUMN IF EXISTS "viewOptionId";
