-- Profitbase is this platform's upstream, and until now its image URLs were
-- stored as-is and handed to every consumer downstream: the broker, and through
-- it every broker's browser, fetched the pictures from Profitbase directly.
--
-- The sync now copies them onto this API's own storage, and this table records
-- which upstream URL became which local file. Without it a later sync would
-- download the whole inventory again: the stored file is named after a hash of
-- its bytes, which cannot be known before those bytes have been fetched.
CREATE TABLE "ProfitbaseImage" (
    "sourceUrl" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfitbaseImage_pkey" PRIMARY KEY ("sourceUrl")
);

-- Identical pictures collapse onto one file, which is Profitbase's normal case:
-- every unit is served its own copy of the same plan.
CREATE INDEX "ProfitbaseImage_url_idx" ON "ProfitbaseImage"("url");
