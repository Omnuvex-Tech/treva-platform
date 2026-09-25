-- A client registered in the broker panel is checked against Bitrix24: a new
-- client becomes a contact and a deal in "Сделки от агентов", one Bitrix
-- already knows (same phone or email) gets no deal. The status now records
-- that outcome instead of a manual review.
ALTER TYPE "ClientStatus" RENAME VALUE 'approved' TO 'deal_created';
ALTER TYPE "ClientStatus" RENAME VALUE 'rejected' TO 'already_in_bitrix';

CREATE TYPE "BitrixSyncState" AS ENUM ('pending', 'synced', 'failed');

ALTER TABLE "Client"
    ADD COLUMN "bitrixContactId" INTEGER,
    ADD COLUMN "bitrixDealId" INTEGER,
    ADD COLUMN "bitrixAssignedById" INTEGER,
    ADD COLUMN "bitrixDealTitle" TEXT,
    ADD COLUMN "bitrixDealStage" TEXT,
    ADD COLUMN "bitrixDealStageSemantics" TEXT,
    ADD COLUMN "bitrixDealAmount" DOUBLE PRECISION,
    ADD COLUMN "bitrixDealCurrency" TEXT,
    ADD COLUMN "bitrixSyncState" "BitrixSyncState" NOT NULL DEFAULT 'pending',
    ADD COLUMN "bitrixSyncError" TEXT,
    ADD COLUMN "bitrixSyncedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Client_bitrixDealId_key" ON "Client"("bitrixDealId");

CREATE INDEX "Client_bitrixSyncState_idx" ON "Client"("bitrixSyncState");
