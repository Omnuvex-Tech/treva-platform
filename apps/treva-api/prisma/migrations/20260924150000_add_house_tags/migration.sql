-- Badges shown on a house (e.g. "Sales start"), edited in the house form.
ALTER TABLE "House" ADD COLUMN "tags" JSONB NOT NULL DEFAULT '[]';
