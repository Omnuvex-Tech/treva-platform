-- The agent form draws an "add another number" button beside the phone
-- (873:48716) and the agency form needs the same, so an account keeps a list of
-- numbers rather than one. The existing number becomes the first entry; blanks
-- become an empty list.
ALTER TABLE "User" ADD COLUMN "phones" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "User" SET "phones" = ARRAY["phone"] WHERE "phone" <> '';

ALTER TABLE "User" DROP COLUMN "phone";
ALTER TABLE "User" ALTER COLUMN "phones" DROP DEFAULT;
