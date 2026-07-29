ALTER TABLE "UnitTypeOption" ADD COLUMN "name" TEXT;
ALTER TABLE "UnitTypeOption" ADD COLUMN "title" TEXT;

UPDATE "UnitTypeOption"
SET "name" = COALESCE("name", "value"),
    "title" = COALESCE("title", "value");

ALTER TABLE "UnitTypeOption" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "UnitTypeOption" ALTER COLUMN "title" SET NOT NULL;

DROP INDEX IF EXISTS "UnitTypeOption_value_key";
ALTER TABLE "UnitTypeOption" DROP COLUMN IF EXISTS "value";

CREATE UNIQUE INDEX "UnitTypeOption_name_key" ON "UnitTypeOption"("name");

