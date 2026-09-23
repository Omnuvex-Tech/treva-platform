-- The inventory sync used to store the developer's own image URLs, so every
-- viewer fetched every drawing from Profitbase on every first view. It now
-- copies them into /uploads/synced and stores that address instead.
--
-- This table is what keeps a later sync from fetching the whole inventory
-- again: the stored file is named after a hash of its bytes, which cannot be
-- known until the bytes have been downloaded, so the source URL is the only
-- thing the sync can check beforehand.
CREATE TABLE "SyncedImage" (
    "sourceUrl" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncedImage_pkey" PRIMARY KEY ("sourceUrl")
);

-- Several sources share one file whenever the drawings are byte-identical,
-- which is the normal case: Profitbase serves every unit its own copy.
CREATE INDEX "SyncedImage_url_idx" ON "SyncedImage"("url");
