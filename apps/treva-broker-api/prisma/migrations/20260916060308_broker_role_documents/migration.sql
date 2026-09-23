-- CreateEnum
CREATE TYPE "DocumentKind" AS ENUM ('pdf', 'pptx', 'docx', 'xlsx', 'image', 'other');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('brochure', 'price_list', 'floor_plan', 'presentation', 'policy', 'other');

-- CreateEnum
CREATE TYPE "DocumentLanguage" AS ENUM ('az', 'en', 'ru');

-- CreateTable
CREATE TABLE "BrokerDocument" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "DocumentKind" NOT NULL DEFAULT 'other',
    "category" "DocumentCategory" NOT NULL DEFAULT 'other',
    "language" "DocumentLanguage" NOT NULL DEFAULT 'en',
    "description" TEXT NOT NULL DEFAULT '',
    "sizeBytes" INTEGER NOT NULL,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "allowDownload" BOOLEAN NOT NULL DEFAULT true,
    "notifyBrokers" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrokerDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrokerDocument_updatedAt_idx" ON "BrokerDocument"("updatedAt");

-- CreateIndex
CREATE INDEX "BrokerDocument_uploadedById_idx" ON "BrokerDocument"("uploadedById");

-- AddForeignKey
ALTER TABLE "BrokerDocument" ADD CONSTRAINT "BrokerDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
