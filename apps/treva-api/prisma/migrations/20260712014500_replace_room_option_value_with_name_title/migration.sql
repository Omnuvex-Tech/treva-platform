ALTER TABLE "RoomOption"
ADD COLUMN "name" TEXT,
ADD COLUMN "title" TEXT;

UPDATE "RoomOption"
SET
  "name" = "value",
  "title" = "value"
WHERE "name" IS NULL
   OR "title" IS NULL;

ALTER TABLE "RoomOption"
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "title" SET NOT NULL;

CREATE UNIQUE INDEX "RoomOption_name_type_key" ON "RoomOption"("name", "type");

DROP INDEX IF EXISTS "RoomOption_value_type_key";

ALTER TABLE "RoomOption"
DROP COLUMN "value";
