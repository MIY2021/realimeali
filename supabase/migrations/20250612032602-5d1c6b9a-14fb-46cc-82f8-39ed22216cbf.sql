
-- Phase 1: Add planned_servings column to household_meal_plans table
-- This is a safe, non-breaking change with proper defaults
ALTER TABLE public.household_meal_plans 
ADD COLUMN planned_servings integer;

-- Set default values for existing records to match their recipe servings
-- This ensures backward compatibility
UPDATE public.household_meal_plans 
SET planned_servings = (
  SELECT servings 
  FROM public.recipes 
  WHERE recipes.id = household_meal_plans.recipe_id
)
WHERE planned_servings IS NULL;

-- Add a constraint to ensure planned_servings is always positive
ALTER TABLE public.household_meal_plans 
ADD CONSTRAINT check_planned_servings_positive 
CHECK (planned_servings > 0);
