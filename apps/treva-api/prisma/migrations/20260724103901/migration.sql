/*
  Warnings:

  - You are about to drop the column `banks` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `infrastructure` on the `Category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "banks",
DROP COLUMN "infrastructure",
ADD COLUMN     "locationTitle" TEXT,
ADD COLUMN     "locationUrl" TEXT;
