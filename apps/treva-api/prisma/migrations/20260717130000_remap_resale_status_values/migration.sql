-- Normalize legacy resale apartment statuses to the new set
UPDATE "Apartment"
SET "status" = 'reserved'
WHERE "status" = 'pending';

UPDATE "Apartment"
SET "status" = 'sold'
WHERE "status" = 'non-active';
