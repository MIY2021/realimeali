-- Make week_number nullable in household_meal_plans table
-- The system now uses week_key (ISO week format like "2025-W52") and date_scheduled
-- for week identification, so week_number is no longer required.

ALTER TABLE household_meal_plans 
ALTER COLUMN week_number DROP NOT NULL;

-- Add a comment explaining the change
COMMENT ON COLUMN household_meal_plans.week_number IS 'Legacy column - nullable. Use week_key or date_scheduled for week identification.';
