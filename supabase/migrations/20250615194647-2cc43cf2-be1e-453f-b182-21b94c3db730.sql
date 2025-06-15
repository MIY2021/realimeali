
-- Add is_completed column to household_meal_plans table
ALTER TABLE public.household_meal_plans 
ADD COLUMN is_completed boolean NOT NULL DEFAULT false;

-- Add an index for better performance on completion queries
CREATE INDEX idx_household_meal_plans_completed 
ON public.household_meal_plans(household_id, is_completed);
