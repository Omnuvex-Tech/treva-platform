/*
  Warnings:

  - A unique constraint covering the columns `[value,type]` on the table `RoomOption` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "RoomOption_value_key";

-- AlterTable
ALTER TABLE "RoomOption" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'off-plan';

-- CreateIndex
CREATE UNIQUE INDEX "RoomOption_value_type_key" ON "RoomOption"("value", "type");
