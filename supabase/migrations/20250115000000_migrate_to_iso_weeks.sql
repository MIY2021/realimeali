-- Migration to support ISO weeks for meal plans and shopping lists
-- This adds week_key columns while keeping week_number for backward compatibility during migration

-- Add week_key column to household_meal_plans
ALTER TABLE household_meal_plans 
ADD COLUMN IF NOT EXISTS week_key TEXT;

-- Add week_key column to household_shopping_lists
ALTER TABLE household_shopping_lists
ADD COLUMN IF NOT EXISTS week_key TEXT;

-- Create indexes for week_key lookups
CREATE INDEX IF NOT EXISTS idx_meal_plans_week_key 
ON household_meal_plans(household_id, week_key);

CREATE INDEX IF NOT EXISTS idx_shopping_lists_week_key
ON household_shopping_lists(household_id, week_key);

-- Note: Actual data migration from week_number to week_key should be done
-- via application code to properly calculate ISO week keys from date_scheduled

