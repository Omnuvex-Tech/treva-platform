-- AlterTable
ALTER TABLE "Apartment" ADD COLUMN     "currencyId" TEXT;

-- AddForeignKey
ALTER TABLE "Apartment" ADD CONSTRAINT "Apartment_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
