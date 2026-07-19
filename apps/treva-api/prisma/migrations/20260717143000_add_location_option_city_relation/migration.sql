-- Add optional city relation for region location options.
ALTER TABLE "LocationOption"
ADD COLUMN "cityId" TEXT;

CREATE INDEX "LocationOption_cityId_idx" ON "LocationOption"("cityId");

ALTER TABLE "LocationOption"
ADD CONSTRAINT "LocationOption_cityId_fkey"
FOREIGN KEY ("cityId") REFERENCES "LocationOption"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;
