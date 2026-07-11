-- AlterTable
ALTER TABLE "Apartment" ADD COLUMN     "balconyArea" DOUBLE PRECISION,
ADD COLUMN     "bathroomCount" INTEGER,
ADD COLUMN     "buildingAge" INTEGER,
ADD COLUMN     "ceilingHeight" DOUBLE PRECISION,
ADD COLUMN     "elevator" BOOLEAN,
ADD COLUMN     "furnishing" TEXT,
ADD COLUMN     "grossArea" DOUBLE PRECISION,
ADD COLUMN     "heatingTypeId" TEXT,
ADD COLUMN     "kitchenArea" DOUBLE PRECISION,
ADD COLUMN     "livingArea" DOUBLE PRECISION,
ADD COLUMN     "netArea" DOUBLE PRECISION,
ADD COLUMN     "parking" BOOLEAN,
ADD COLUMN     "viewOptionId" TEXT;

-- CreateTable
CREATE TABLE "HeatingTypeOption" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeatingTypeOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HeatingTypeOption_value_key" ON "HeatingTypeOption"("value");

-- AddForeignKey
ALTER TABLE "Apartment" ADD CONSTRAINT "Apartment_heatingTypeId_fkey" FOREIGN KEY ("heatingTypeId") REFERENCES "HeatingTypeOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Apartment" ADD CONSTRAINT "Apartment_viewOptionId_fkey" FOREIGN KEY ("viewOptionId") REFERENCES "ViewOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
