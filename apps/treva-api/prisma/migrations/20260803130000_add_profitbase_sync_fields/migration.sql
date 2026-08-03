ALTER TABLE "Category" ADD COLUMN "externalId" TEXT;
ALTER TABLE "House" ADD COLUMN "externalId" TEXT;
ALTER TABLE "House" ADD COLUMN "unitCode" TEXT;
ALTER TABLE "House" ADD COLUMN "rooms" INTEGER;
ALTER TABLE "UnitLayout" ADD COLUMN "externalId" TEXT;
ALTER TABLE "UnitLayout" ADD COLUMN "unitCode" TEXT;
ALTER TABLE "UnitLayout" ADD COLUMN "rooms" INTEGER;

CREATE UNIQUE INDEX "Category_externalId_key" ON "Category"("externalId");
CREATE UNIQUE INDEX "House_externalId_key" ON "House"("externalId");
CREATE UNIQUE INDEX "UnitLayout_externalId_key" ON "UnitLayout"("externalId");
