DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Apartment'
      AND column_name = 'completionYear'
  ) THEN
    ALTER TABLE "Apartment"
    DROP COLUMN "completionYear";
  END IF;
END $$;
