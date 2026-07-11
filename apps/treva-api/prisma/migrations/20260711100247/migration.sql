-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'object',
ADD COLUMN IF NOT EXISTS "documents" JSONB NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE "LcdOption" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LcdOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeOfBuildingOption" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TypeOfBuildingOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyTypeOption" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyTypeOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConstructionStageOption" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConstructionStageOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOfficeOption" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesOfficeOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LcdOption_value_key" ON "LcdOption"("value");

-- CreateIndex
CREATE UNIQUE INDEX "TypeOfBuildingOption_value_key" ON "TypeOfBuildingOption"("value");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyTypeOption_value_key" ON "PropertyTypeOption"("value");

-- CreateIndex
CREATE UNIQUE INDEX "ConstructionStageOption_value_key" ON "ConstructionStageOption"("value");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOfficeOption_value_key" ON "SalesOfficeOption"("value");
