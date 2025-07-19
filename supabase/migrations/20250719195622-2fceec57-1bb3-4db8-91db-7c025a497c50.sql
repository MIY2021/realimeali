-- Update recipes that still have empty meal_types arrays
-- Populate them with their legacy meal_type value if it exists

UPDATE public.recipes 
SET meal_types = ARRAY[meal_type::text]
WHERE meal_types = ARRAY[]::text[] 
  AND meal_type IS NOT NULL;

-- Update household_meal_plans that still have empty meal_types arrays  
UPDATE public.household_meal_plans
SET meal_types = ARRAY[meal_type]
WHERE meal_types = ARRAY[]::text[]
  AND meal_type IS NOT NULL;