CREATE TABLE "UnitTypeOption" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitTypeOption_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UnitTypeOption_value_key" ON "UnitTypeOption"("value");

ALTER TABLE "UnitLayout" DROP CONSTRAINT IF EXISTS "UnitLayout_roomOptionId_fkey";
ALTER TABLE "UnitLayout" DROP COLUMN IF EXISTS "roomOptionId";
ALTER TABLE "UnitLayout" ADD COLUMN "unitTypeOptionId" TEXT;

ALTER TABLE "UnitLayout" ADD CONSTRAINT "UnitLayout_unitTypeOptionId_fkey" FOREIGN KEY ("unitTypeOptionId") REFERENCES "UnitTypeOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

