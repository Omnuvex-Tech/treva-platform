-- Every broker becomes a contact in Bitrix24 (type "Агенты") as soon as their
-- account exists, not only once they register a client. The id is kept so the
-- broker is looked up in Bitrix once, and linked on every deal after that.
ALTER TABLE "User" ADD COLUMN "bitrixContactId" INTEGER;
