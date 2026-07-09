/*
  Warnings:

  - You are about to drop the `Article` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Author` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Keyword` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PulseCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ArticleToKeyword` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_authorId_fkey";

-- DropForeignKey
ALTER TABLE "_ArticleToKeyword" DROP CONSTRAINT "_ArticleToKeyword_A_fkey";

-- DropForeignKey
ALTER TABLE "_ArticleToKeyword" DROP CONSTRAINT "_ArticleToKeyword_B_fkey";

-- AlterTable
ALTER TABLE "Apartment" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "area" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'Rubels',
ADD COLUMN     "developerBrand" TEXT,
ADD COLUMN     "fedLaw214" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "housesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "objectType" TEXT NOT NULL DEFAULT 'Resident Complex',
ADD COLUMN     "propertiesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "propertyName" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "reservedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "soldCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "website" TEXT;

-- DropTable
DROP TABLE "Article";

-- DropTable
DROP TABLE "Author";

-- DropTable
DROP TABLE "Keyword";

-- DropTable
DROP TABLE "PulseCategory";

-- DropTable
DROP TABLE "_ArticleToKeyword";

-- CreateTable
CREATE TABLE "ObjectType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObjectType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ObjectType_slug_key" ON "ObjectType"("slug");
