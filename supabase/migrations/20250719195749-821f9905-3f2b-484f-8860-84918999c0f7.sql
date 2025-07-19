-- Temporarily remove the not empty constraint to handle transitions
-- We'll add validation in the application layer instead

ALTER TABLE public.recipes 
DROP CONSTRAINT IF EXISTS check_meal_types_not_empty;

ALTER TABLE public.household_meal_plans 
DROP CONSTRAINT IF EXISTS check_meal_types_not_empty;

ALTER TABLE public.public_recipe_shares 
DROP CONSTRAINT IF EXISTS check_meal_types_not_empty;