-- Enable Supabase Realtime for household meal-plan changes.
-- This is idempotent so it is safe if either table is already published.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'household_meal_plans'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.household_meal_plans;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'recipe_swipes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.recipe_swipes;
  END IF;
END $$;
