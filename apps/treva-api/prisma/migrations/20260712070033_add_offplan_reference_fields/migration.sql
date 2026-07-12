-- AlterTable
ALTER TABLE "UnitLayout" ADD COLUMN     "attributeIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "heatingTypeIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "locationTitle" TEXT,
ADD COLUMN     "locationUrl" TEXT,
ADD COLUMN     "ownerId" TEXT;

-- AddForeignKey
ALTER TABLE "UnitLayout" ADD CONSTRAINT "UnitLayout_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
