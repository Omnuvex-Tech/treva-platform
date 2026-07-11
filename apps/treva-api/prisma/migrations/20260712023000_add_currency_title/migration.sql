ALTER TABLE "Currency"
ADD COLUMN "title" TEXT;

UPDATE "Currency"
SET "title" = "name"
WHERE "title" IS NULL;

ALTER TABLE "Currency"
ALTER COLUMN "title" SET NOT NULL;
