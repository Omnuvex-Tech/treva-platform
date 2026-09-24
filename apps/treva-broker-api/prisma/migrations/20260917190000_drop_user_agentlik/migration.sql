-- The agent form carried both "Agentlik" (873:48722) and "Agency" (873:48724).
-- They named the same real-estate agency, so the duplicate column is dropped and
-- the form keeps Agency alone.
ALTER TABLE "User" DROP COLUMN "agentlik";
