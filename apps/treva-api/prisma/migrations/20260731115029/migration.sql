/*
  Warnings:

  - You are about to drop the column `completionOfConstruction` on the `House` table. All the data in the column will be lost.
  - You are about to drop the column `endOfSales` on the `House` table. All the data in the column will be lost.
  - You are about to drop the column `startOfConstruction` on the `House` table. All the data in the column will be lost.
  - You are about to drop the column `startOfSales` on the `House` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "House" DROP COLUMN "completionOfConstruction",
DROP COLUMN "endOfSales",
DROP COLUMN "startOfConstruction",
DROP COLUMN "startOfSales";
