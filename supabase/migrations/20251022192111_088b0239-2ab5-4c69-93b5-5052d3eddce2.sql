-- Add composite index for meal plans query optimization
CREATE INDEX IF NOT EXISTS idx_household_meal_plans_household_week 
ON household_meal_plans(household_id, week_number, created_at DESC);

-- Add composite index for recipes query optimization  
CREATE INDEX IF NOT EXISTS idx_recipes_household_deleted 
ON recipes(household_id, is_deleted, created_at DESC) 
WHERE is_deleted = false;