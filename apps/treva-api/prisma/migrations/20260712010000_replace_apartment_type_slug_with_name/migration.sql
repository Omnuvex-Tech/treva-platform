ALTER TABLE "ApartmentType"
ADD COLUMN "name" TEXT;

UPDATE "ApartmentType"
SET "name" = "slug"
WHERE "name" IS NULL;

ALTER TABLE "ApartmentType"
ALTER COLUMN "name" SET NOT NULL;

CREATE UNIQUE INDEX "ApartmentType_name_key" ON "ApartmentType"("name");

DROP INDEX IF EXISTS "ApartmentType_slug_key";

ALTER TABLE "ApartmentType"
DROP COLUMN "slug";
