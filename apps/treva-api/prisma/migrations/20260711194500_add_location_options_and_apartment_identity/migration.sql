ALTER TABLE "Apartment"
ADD COLUMN "name" TEXT,
ADD COLUMN "purpose" TEXT NOT NULL DEFAULT 'sale',
ADD COLUMN "region" TEXT,
ADD COLUMN "city" TEXT;

CREATE TABLE "LocationOption" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocationOption_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LocationOption_type_name_key" ON "LocationOption"("type", "name");
