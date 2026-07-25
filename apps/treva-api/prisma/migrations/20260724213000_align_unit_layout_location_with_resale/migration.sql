ALTER TABLE "UnitLayout"
ADD COLUMN IF NOT EXISTS "locationGoogleMapsUrl" TEXT;

ALTER TABLE "UnitLayout"
DROP COLUMN IF EXISTS "contractAddress",
DROP COLUMN IF EXISTS "street",
DROP COLUMN IF EXISTS "houseNumber",
DROP COLUMN IF EXISTS "deadlineForCommissioning",
DROP COLUMN IF EXISTS "landCadastralNumber",
DROP COLUMN IF EXISTS "showroomAvailability";
