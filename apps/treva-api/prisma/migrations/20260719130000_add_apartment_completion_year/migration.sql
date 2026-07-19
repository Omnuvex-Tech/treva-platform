DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Apartment'
      AND column_name = 'completionYear'
  ) THEN
    ALTER TABLE "Apartment"
    ADD COLUMN "completionYear" INTEGER;
  END IF;
END $$;
