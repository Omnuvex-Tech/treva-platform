-- CreateEnum
CREATE TYPE "Status" AS ENUM ('available', 'sold', 'reserved');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitLayout" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'available',
    "floor" INTEGER NOT NULL,
    "totalArea" DOUBLE PRECISION NOT NULL,
    "internalArea" DOUBLE PRECISION NOT NULL,
    "balconyArea" DOUBLE PRECISION,
    "priceUsd" DOUBLE PRECISION NOT NULL,
    "priceAzn" DOUBLE PRECISION NOT NULL,
    "completionYear" INTEGER NOT NULL,
    "numberOfFloors" JSONB NOT NULL,
    "view" TEXT,
    "similarApartmentIds" TEXT[],
    "mainImage" JSONB,
    "gallery" JSONB[],
    "documents" JSONB[],
    "location" JSONB,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitLayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "UnitLayout_slug_key" ON "UnitLayout"("slug");

-- AddForeignKey
ALTER TABLE "UnitLayout" ADD CONSTRAINT "UnitLayout_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
