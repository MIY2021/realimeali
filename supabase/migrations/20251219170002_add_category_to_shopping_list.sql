-- Add category column to household_shopping_lists table
ALTER TABLE public.household_shopping_lists
ADD COLUMN IF NOT EXISTS category TEXT;

-- Create index on category for sorting/filtering
CREATE INDEX IF NOT EXISTS idx_shopping_lists_category 
ON public.household_shopping_lists(household_id, category);
