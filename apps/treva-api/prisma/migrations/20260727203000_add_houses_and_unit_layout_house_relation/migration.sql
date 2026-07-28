CREATE TABLE "House" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "canonicalUrl" TEXT,
    "seoImage" TEXT,
    "floor" INTEGER NOT NULL,
    "number" INTEGER,
    "totalArea" DOUBLE PRECISION NOT NULL,
    "internalArea" DOUBLE PRECISION NOT NULL,
    "balconyArea" DOUBLE PRECISION,
    "prices" JSONB NOT NULL DEFAULT '{}',
    "completionYear" INTEGER NOT NULL,
    "numberOfFloors" JSONB NOT NULL,
    "similarApartmentIds" TEXT[],
    "mainImage" JSONB,
    "coverImage" JSONB,
    "gallery" JSONB NOT NULL DEFAULT '[]',
    "documents" JSONB NOT NULL DEFAULT '[]',
    "location" JSONB,
    "categoryId" TEXT NOT NULL,
    "roomOptionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'available',
    "statusOptionId" TEXT,
    "lcd" TEXT,
    "typeOfBuilding" TEXT,
    "defaultPropertyType" TEXT,
    "constructionStage" TEXT,
    "startOfConstruction" JSONB,
    "completionOfConstruction" JSONB,
    "startOfSales" JSONB,
    "endOfSales" JSONB,
    "description" TEXT,
    "ownerId" TEXT,
    "heatingTypeIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "attributeIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "locationTitle" TEXT,
    "locationUrl" TEXT,
    "locationGoogleMapsUrl" TEXT,
    "street" TEXT,
    "houseNumber" TEXT,
    "finishingFacilities" TEXT,
    "houseMaterial" TEXT,
    "deadlineForCommissioning" TEXT,
    "salesOffice" TEXT,
    "landCadastralNumber" TEXT,
    "contractAddress" TEXT,
    "secondContractAddress" TEXT,
    "showroomAvailability" TEXT,
    "secondShowroomAvailability" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "House_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "House_slug_key" ON "House"("slug");

ALTER TABLE "UnitLayout" ADD COLUMN "houseId" TEXT;

ALTER TABLE "House" ADD CONSTRAINT "House_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "House" ADD CONSTRAINT "House_roomOptionId_fkey" FOREIGN KEY ("roomOptionId") REFERENCES "RoomOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "House" ADD CONSTRAINT "House_statusOptionId_fkey" FOREIGN KEY ("statusOptionId") REFERENCES "StatusOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "House" ADD CONSTRAINT "House_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UnitLayout" ADD CONSTRAINT "UnitLayout_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE SET NULL ON UPDATE CASCADE;
