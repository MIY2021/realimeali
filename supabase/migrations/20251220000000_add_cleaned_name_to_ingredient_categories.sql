-- Add cleaned_name column to ingredient_categories table
ALTER TABLE public.ingredient_categories
ADD COLUMN IF NOT EXISTS cleaned_name TEXT;

-- Create index on cleaned_name for lookups
CREATE INDEX IF NOT EXISTS idx_ingredient_categories_cleaned_name 
ON public.ingredient_categories(cleaned_name);

