
-- Remove the main_ingredient column from the recipes table
ALTER TABLE public.recipes DROP COLUMN IF EXISTS main_ingredient;

-- Drop the main_ingredient enum type if it exists and is no longer used
DROP TYPE IF EXISTS main_ingredient;
