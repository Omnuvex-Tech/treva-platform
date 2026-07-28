/*
  Warnings:

  - The `gallery` column on the `House` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `documents` column on the `House` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "House" DROP COLUMN "gallery",
ADD COLUMN     "gallery" JSONB[],
DROP COLUMN "documents",
ADD COLUMN     "documents" JSONB[];
