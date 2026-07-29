-- Drop FK + column on House
ALTER TABLE "House" DROP CONSTRAINT IF EXISTS "House_roomOptionId_fkey";
ALTER TABLE "House" DROP COLUMN IF EXISTS "roomOptionId";

-- Drop RoomOption table
DROP TABLE IF EXISTS "RoomOption";
