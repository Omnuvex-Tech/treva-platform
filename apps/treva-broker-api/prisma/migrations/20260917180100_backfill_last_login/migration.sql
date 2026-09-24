-- Sign-up has always signed the new account in without recording it. Those
-- accounts are not agents waiting for a first login, so they take their
-- creation time as the login the Users screen's status reads.
UPDATE "User" SET "lastLoginAt" = "createdAt" WHERE "lastLoginAt" IS NULL;
