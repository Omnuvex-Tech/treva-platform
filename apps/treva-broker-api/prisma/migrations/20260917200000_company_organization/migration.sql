-- The Organization column on the Real Estate Agencies tab (873:48597) had no
-- store behind it: the list served "" for every row. The admin agency form
-- fills it.
ALTER TABLE "Company" ADD COLUMN "organization" TEXT NOT NULL DEFAULT '';
