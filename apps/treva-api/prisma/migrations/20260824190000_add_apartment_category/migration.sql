-- AlterTable
ALTER TABLE "Apartment"
ADD COLUMN "categoryId" TEXT;

-- CreateIndex
CREATE INDEX "Apartment_categoryId_idx" ON "Apartment"("categoryId");

-- AddForeignKey
ALTER TABLE "Apartment"
ADD CONSTRAINT "Apartment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
