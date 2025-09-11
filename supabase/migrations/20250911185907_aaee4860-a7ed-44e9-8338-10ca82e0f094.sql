-- Update the meal_type constraint to include all supported meal types
ALTER TABLE public.household_meal_plans 
DROP CONSTRAINT IF EXISTS household_meal_plans_meal_type_check;

-- Add the updated constraint with all 8 meal types
ALTER TABLE public.household_meal_plans 
ADD CONSTRAINT household_meal_plans_meal_type_check 
CHECK (meal_type = ANY(ARRAY['breakfast'::text, 'lunch'::text, 'dinner'::text, 'snacks'::text, 'sides'::text, 'desserts'::text, 'drinks'::text, 'appetizers'::text]));