ALTER TABLE "UnitLayout"
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'available';

UPDATE "UnitLayout" AS ul
SET "status" = CASE
  WHEN lower(so."value") = 'sold' THEN 'sold'
  WHEN lower(so."value") = 'reserved' THEN 'reserved'
  ELSE 'available'
END
FROM "StatusOption" AS so
WHERE ul."statusOptionId" = so."id";
