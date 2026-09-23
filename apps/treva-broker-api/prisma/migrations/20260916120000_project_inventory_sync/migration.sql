-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('available', 'reserved', 'sold', 'blocked');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "syncedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ProjectBuilding" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "floorsFrom" INTEGER NOT NULL DEFAULT 1,
    "floorsTo" INTEGER NOT NULL DEFAULT 1,
    "completionYear" INTEGER,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectBuilding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectUnit" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "status" "UnitStatus" NOT NULL DEFAULT 'available',
    "realEstateType" TEXT NOT NULL DEFAULT '',
    "bedrooms" INTEGER NOT NULL DEFAULT 0,
    "areaSqm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "internalAreaSqm" DOUBLE PRECISION,
    "loggiaSqm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "priceAzn" INTEGER,
    "priceUsd" INTEGER,
    "priceEur" INTEGER,
    "planImageUrl" TEXT,
    "completionYear" INTEGER,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectBuilding_externalId_key" ON "ProjectBuilding"("externalId");

-- CreateIndex
CREATE INDEX "ProjectBuilding_projectId_idx" ON "ProjectBuilding"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectUnit_externalId_key" ON "ProjectUnit"("externalId");

-- CreateIndex
CREATE INDEX "ProjectUnit_projectId_idx" ON "ProjectUnit"("projectId");

-- CreateIndex
CREATE INDEX "ProjectUnit_buildingId_floor_idx" ON "ProjectUnit"("buildingId", "floor");

-- CreateIndex
CREATE INDEX "ProjectUnit_status_idx" ON "ProjectUnit"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Project_externalId_key" ON "Project"("externalId");

-- AddForeignKey
ALTER TABLE "ProjectBuilding" ADD CONSTRAINT "ProjectBuilding_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectUnit" ADD CONSTRAINT "ProjectUnit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectUnit" ADD CONSTRAINT "ProjectUnit_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "ProjectBuilding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

