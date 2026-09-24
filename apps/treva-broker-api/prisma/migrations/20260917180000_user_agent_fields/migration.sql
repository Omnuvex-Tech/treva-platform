-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accessPermission" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "agentlik" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "cooperationType" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "phone" TEXT NOT NULL DEFAULT '';
