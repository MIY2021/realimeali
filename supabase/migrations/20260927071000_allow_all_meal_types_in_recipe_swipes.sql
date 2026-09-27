ALTER TABLE public.recipe_swipes
  DROP CONSTRAINT IF EXISTS recipe_swipes_meal_type_check;

ALTER TABLE public.recipe_swipes
  ADD CONSTRAINT recipe_swipes_meal_type_check
  CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snacks', 'sides', 'desserts', 'drinks', 'appetizers', 'sauce'));
