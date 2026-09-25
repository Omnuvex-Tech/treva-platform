-- Synced records changed in the panel; Transfers leave them alone.
ALTER TABLE "Category" ADD COLUMN "editedInInventoryAt" TIMESTAMP(3);
ALTER TABLE "House" ADD COLUMN "editedInInventoryAt" TIMESTAMP(3);
ALTER TABLE "UnitLayout" ADD COLUMN "editedInInventoryAt" TIMESTAMP(3);

-- Synced records deleted in the panel; Transfers do not re-create them.
CREATE TABLE "ProfitbaseDeletion" (
    "entity" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfitbaseDeletion_pkey" PRIMARY KEY ("entity","externalId")
);
