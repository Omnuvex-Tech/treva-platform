ALTER TABLE "ViewOption"
ADD COLUMN "name" TEXT,
ADD COLUMN "title" TEXT;

UPDATE "ViewOption"
SET
  "name" = "value",
  "title" = "value"
WHERE "name" IS NULL
   OR "title" IS NULL;

ALTER TABLE "ViewOption"
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "title" SET NOT NULL;

CREATE UNIQUE INDEX "ViewOption_name_key" ON "ViewOption"("name");

DROP INDEX IF EXISTS "ViewOption_value_key";

ALTER TABLE "ViewOption"
DROP COLUMN "value";

ALTER TABLE "HeatingTypeOption"
ADD COLUMN "name" TEXT,
ADD COLUMN "title" TEXT;

UPDATE "HeatingTypeOption"
SET
  "name" = "value",
  "title" = "value"
WHERE "name" IS NULL
   OR "title" IS NULL;

ALTER TABLE "HeatingTypeOption"
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "title" SET NOT NULL;

CREATE UNIQUE INDEX "HeatingTypeOption_name_key" ON "HeatingTypeOption"("name");

DROP INDEX IF EXISTS "HeatingTypeOption_value_key";

ALTER TABLE "HeatingTypeOption"
DROP COLUMN "value";
