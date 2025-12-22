-- Migration to backfill cleaned_name for existing ingredient_categories
-- 
-- This migration provides a temporary fallback by setting cleaned_name to ingredient_name
-- for records where it's null. However, for proper cleaning, you should run the
-- backfill-cleaned-names Edge Function which uses AI to generate proper cleaned names.
--
-- To run the proper backfill:
-- 1. Ensure the backfill-cleaned-names Edge Function is deployed
-- 2. Call it via Supabase Dashboard Functions or API:
--    POST https://[your-project].supabase.co/functions/v1/backfill-cleaned-names
--    Headers: { "Authorization": "Bearer [service-role-key]" }
--    Body: { "dryRun": false, "batchSize": 10 }
--
-- The Edge Function will:
-- - Find all ingredients with null or empty cleaned_name
-- - Use AI to generate proper cleaned names
-- - Update the database with cleaned names
-- - Process in batches to avoid rate limits

-- Temporary fallback: set cleaned_name to ingredient_name for null records
-- This ensures the column has a value, but proper cleaning should be done via Edge Function
UPDATE public.ingredient_categories
SET cleaned_name = ingredient_name
WHERE cleaned_name IS NULL OR cleaned_name = '';

-- Log the update
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Set cleaned_name to ingredient_name for % records. Run backfill-cleaned-names Edge Function for proper AI cleaning.', updated_count;
END $$;

