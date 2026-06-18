/*
  Warnings:

  - You are about to drop the column `currencyId` on the `Apartment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Apartment" DROP CONSTRAINT "Apartment_currencyId_fkey";

-- AlterTable
ALTER TABLE "Apartment" DROP COLUMN "currencyId",
ALTER COLUMN "priceTotal" SET DEFAULT 0,
ALTER COLUMN "priceByArea" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "ApartmentPrice" (
    "id" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "currencyId" TEXT NOT NULL,
    "priceTotal" DOUBLE PRECISION NOT NULL,
    "priceByArea" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ApartmentPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApartmentPrice_apartmentId_currencyId_key" ON "ApartmentPrice"("apartmentId", "currencyId");

-- AddForeignKey
ALTER TABLE "ApartmentPrice" ADD CONSTRAINT "ApartmentPrice_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApartmentPrice" ADD CONSTRAINT "ApartmentPrice_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
