CREATE TABLE IF NOT EXISTS public.recipe_swipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  week_key TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('yes', 'no')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (household_id, user_id, recipe_id, week_key)
);

CREATE INDEX IF NOT EXISTS idx_recipe_swipes_household_week
  ON public.recipe_swipes (household_id, week_key);

CREATE INDEX IF NOT EXISTS idx_recipe_swipes_user_week
  ON public.recipe_swipes (user_id, household_id, week_key);

ALTER TABLE public.recipe_swipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Household members can view recipe swipes" ON public.recipe_swipes;
CREATE POLICY "Household members can view recipe swipes"
ON public.recipe_swipes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.household_members hm
    WHERE hm.household_id = recipe_swipes.household_id
      AND hm.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create their own recipe swipes" ON public.recipe_swipes;
CREATE POLICY "Users can create their own recipe swipes"
ON public.recipe_swipes FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.household_members hm
    WHERE hm.household_id = recipe_swipes.household_id
      AND hm.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update their own recipe swipes" ON public.recipe_swipes;
CREATE POLICY "Users can update their own recipe swipes"
ON public.recipe_swipes FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.household_members hm
    WHERE hm.household_id = recipe_swipes.household_id
      AND hm.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete their own recipe swipes" ON public.recipe_swipes;
CREATE POLICY "Users can delete their own recipe swipes"
ON public.recipe_swipes FOR DELETE
USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.update_recipe_swipes_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_recipe_swipes_updated_at ON public.recipe_swipes;
CREATE TRIGGER update_recipe_swipes_updated_at
BEFORE UPDATE ON public.recipe_swipes
FOR EACH ROW EXECUTE FUNCTION public.update_recipe_swipes_updated_at();
