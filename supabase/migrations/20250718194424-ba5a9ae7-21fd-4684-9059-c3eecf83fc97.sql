-- Update the recipes table to support multiple meal types as an array
-- This migration converts the existing meal_type column from a single enum value to an array

-- First, create a new temporary column for meal_types array
ALTER TABLE public.recipes ADD COLUMN meal_types text[];

-- Migrate existing single meal_type values to the new meal_types array
UPDATE public.recipes 
SET meal_types = CASE 
  WHEN meal_type IS NOT NULL THEN ARRAY[meal_type::text]
  ELSE ARRAY[]::text[]
END;

-- Set default value and NOT NULL constraint for meal_types
ALTER TABLE public.recipes 
ALTER COLUMN meal_types SET DEFAULT ARRAY[]::text[],
ALTER COLUMN meal_types SET NOT NULL;

-- Update the household_meal_plans table to support multiple meal types
-- First add the new column
ALTER TABLE public.household_meal_plans ADD COLUMN meal_types text[];

-- Migrate existing data
UPDATE public.household_meal_plans 
SET meal_types = CASE 
  WHEN meal_type IS NOT NULL THEN ARRAY[meal_type]
  ELSE ARRAY[]::text[]
END;

-- Set default value and NOT NULL constraint
ALTER TABLE public.household_meal_plans 
ALTER COLUMN meal_types SET DEFAULT ARRAY[]::text[],
ALTER COLUMN meal_types SET NOT NULL;

-- Update public_recipe_shares table similarly
ALTER TABLE public.public_recipe_shares ADD COLUMN meal_types text[];

UPDATE public.public_recipe_shares 
SET meal_types = CASE 
  WHEN categories IS NOT NULL AND array_length(categories, 1) > 0 THEN 
    -- Extract meal type from categories array if it exists
    ARRAY(SELECT unnest(categories::text[]) WHERE unnest(categories::text[]) IN ('breakfast', 'lunch', 'dinner', 'snacks', 'sides', 'desserts', 'drinks'))
  ELSE ARRAY[]::text[]
END;

-- Set default for meal_types in public_recipe_shares
ALTER TABLE public.public_recipe_shares 
ALTER COLUMN meal_types SET DEFAULT ARRAY[]::text[],
ALTER COLUMN meal_types SET NOT NULL;

-- Create indexes for better performance on array queries
CREATE INDEX idx_recipes_meal_types ON public.recipes USING GIN (meal_types);
CREATE INDEX idx_household_meal_plans_meal_types ON public.household_meal_plans USING GIN (meal_types);
CREATE INDEX idx_public_recipe_shares_meal_types ON public.public_recipe_shares USING GIN (meal_types);

-- Add constraint to ensure meal_types contains valid values
ALTER TABLE public.recipes 
ADD CONSTRAINT check_meal_types_valid 
CHECK (meal_types <@ ARRAY['breakfast', 'lunch', 'dinner', 'snacks', 'sides', 'desserts', 'drinks']::text[]);

ALTER TABLE public.household_meal_plans 
ADD CONSTRAINT check_meal_types_valid 
CHECK (meal_types <@ ARRAY['breakfast', 'lunch', 'dinner', 'snacks', 'sides', 'desserts', 'drinks']::text[]);

ALTER TABLE public.public_recipe_shares 
ADD CONSTRAINT check_meal_types_valid 
CHECK (meal_types <@ ARRAY['breakfast', 'lunch', 'dinner', 'snacks', 'sides', 'desserts', 'drinks']::text[]);

-- Add constraint to ensure at least one meal type is selected
ALTER TABLE public.recipes 
ADD CONSTRAINT check_meal_types_not_empty 
CHECK (array_length(meal_types, 1) > 0);

ALTER TABLE public.household_meal_plans 
ADD CONSTRAINT check_meal_types_not_empty 
CHECK (array_length(meal_types, 1) > 0);

ALTER TABLE public.public_recipe_shares 
ADD CONSTRAINT check_meal_types_not_empty 
CHECK (array_length(meal_types, 1) > 0);