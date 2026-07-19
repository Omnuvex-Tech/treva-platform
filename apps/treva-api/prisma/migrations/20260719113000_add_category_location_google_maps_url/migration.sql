DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Category'
      AND column_name = 'locationGoogleMapsUrl'
  ) THEN
    ALTER TABLE "Category"
    ADD COLUMN "locationGoogleMapsUrl" TEXT;
  END IF;
END $$;
