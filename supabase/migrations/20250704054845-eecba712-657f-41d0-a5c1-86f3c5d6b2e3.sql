-- This migration adds support for freetyped meals in the meal planner
-- The database already has the necessary columns: is_freetyped, meal_name
-- This migration just ensures proper indexing and constraints

-- Add index for freetyped meals for better query performance
CREATE INDEX IF NOT EXISTS idx_household_meal_plans_freetyped 
ON household_meal_plans(household_id, is_freetyped, week_number);

-- Add check constraint to ensure either recipe_id or meal_name is provided
-- but not both for freetyped meals
CREATE OR REPLACE FUNCTION validate_meal_plan_data()
RETURNS TRIGGER AS $$
BEGIN
  -- If it's a freetyped meal, meal_name must be provided and recipe_id should be null
  IF NEW.is_freetyped = true THEN
    IF NEW.meal_name IS NULL OR NEW.meal_name = '' THEN
      RAISE EXCEPTION 'meal_name is required for freetyped meals';
    END IF;
    -- Allow recipe_id to be null for freetyped meals
    NEW.recipe_id := NULL;
  ELSE
    -- If it's not a freetyped meal, recipe_id must be provided
    IF NEW.recipe_id IS NULL THEN
      RAISE EXCEPTION 'recipe_id is required for non-freetyped meals';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate meal plan data
DROP TRIGGER IF EXISTS validate_meal_plan_trigger ON household_meal_plans;
CREATE TRIGGER validate_meal_plan_trigger
  BEFORE INSERT OR UPDATE ON household_meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION validate_meal_plan_data();