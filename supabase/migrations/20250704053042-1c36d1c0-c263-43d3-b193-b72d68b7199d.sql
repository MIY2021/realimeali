
-- Modify household_meal_plans table to support freetyped meals
ALTER TABLE public.household_meal_plans 
ADD COLUMN meal_name TEXT,
ADD COLUMN is_freetyped BOOLEAN NOT NULL DEFAULT false;

-- Make recipe_id nullable to allow freetyped meals
ALTER TABLE public.household_meal_plans 
ALTER COLUMN recipe_id DROP NOT NULL;

-- Add a check constraint to ensure either recipe_id or meal_name is provided
ALTER TABLE public.household_meal_plans 
ADD CONSTRAINT check_meal_type 
CHECK (
  (recipe_id IS NOT NULL AND is_freetyped = false) OR 
  (meal_name IS NOT NULL AND is_freetyped = true)
);
