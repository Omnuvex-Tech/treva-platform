-- Remove parking and elevator from resale apartment model.
ALTER TABLE "Apartment"
DROP COLUMN IF EXISTS "parking",
DROP COLUMN IF EXISTS "elevator";
