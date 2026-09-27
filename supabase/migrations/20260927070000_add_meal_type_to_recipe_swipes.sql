ALTER TABLE public.recipe_swipes
  ADD COLUMN IF NOT EXISTS meal_type TEXT NOT NULL DEFAULT 'dinner'
  CHECK (meal_type IN ('breakfast', 'lunch', 'dinner'));

ALTER TABLE public.recipe_swipes
  DROP CONSTRAINT IF EXISTS recipe_swipes_household_id_user_id_recipe_id_week_key_key;

ALTER TABLE public.recipe_swipes
  ADD CONSTRAINT recipe_swipes_household_user_recipe_week_meal_key
  UNIQUE (household_id, user_id, recipe_id, week_key, meal_type);

CREATE INDEX IF NOT EXISTS idx_recipe_swipes_user_week_meal
  ON public.recipe_swipes (user_id, household_id, week_key, meal_type);
