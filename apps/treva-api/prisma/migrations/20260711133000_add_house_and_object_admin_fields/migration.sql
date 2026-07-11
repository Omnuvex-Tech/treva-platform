-- Keep the database schema in sync with the admin House/Object forms.
-- These statements are intentionally idempotent because some local databases
-- may already have been altered while the migration history lagged behind.

ALTER TABLE "UnitLayout"
ADD COLUMN IF NOT EXISTS "lcd" TEXT,
ADD COLUMN IF NOT EXISTS "typeOfBuilding" TEXT,
ADD COLUMN IF NOT EXISTS "defaultPropertyType" TEXT,
ADD COLUMN IF NOT EXISTS "constructionStage" TEXT,
ADD COLUMN IF NOT EXISTS "startOfConstruction" JSONB,
ADD COLUMN IF NOT EXISTS "completionOfConstruction" JSONB,
ADD COLUMN IF NOT EXISTS "startOfSales" JSONB,
ADD COLUMN IF NOT EXISTS "endOfSales" JSONB,
ADD COLUMN IF NOT EXISTS "salesOffice" TEXT,
ADD COLUMN IF NOT EXISTS "contractAddress" TEXT,
ADD COLUMN IF NOT EXISTS "street" TEXT,
ADD COLUMN IF NOT EXISTS "houseNumber" TEXT,
ADD COLUMN IF NOT EXISTS "deadlineForCommissioning" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "landCadastralNumber" TEXT,
ADD COLUMN IF NOT EXISTS "showroomAvailability" TEXT,
ADD COLUMN IF NOT EXISTS "renovation" TEXT,
ADD COLUMN IF NOT EXISTS "wallMaterial" TEXT,
ADD COLUMN IF NOT EXISTS "description" TEXT;

ALTER TABLE "Category"
ADD COLUMN IF NOT EXISTS "banks" TEXT,
ADD COLUMN IF NOT EXISTS "infrastructure" TEXT,
ADD COLUMN IF NOT EXISTS "salesDepartment" TEXT,
ADD COLUMN IF NOT EXISTS "documents" JSONB DEFAULT '[]';
