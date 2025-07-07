-- Add recipe source tracking columns
ALTER TABLE public.recipes 
ADD COLUMN IF NOT EXISTS source_url text,
ADD COLUMN IF NOT EXISTS import_method text DEFAULT 'manual';

-- Create recipe notes table for household-level notes
CREATE TABLE IF NOT EXISTS public.recipe_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(recipe_id, household_id)
);

-- Enable RLS on recipe_notes
ALTER TABLE public.recipe_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for recipe notes
CREATE POLICY "Household members can view recipe notes" ON public.recipe_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.household_members 
      WHERE household_id = recipe_notes.household_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Household members can create recipe notes" ON public.recipe_notes
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.household_members 
      WHERE household_id = recipe_notes.household_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Household members can update recipe notes" ON public.recipe_notes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.household_members 
      WHERE household_id = recipe_notes.household_id 
      AND user_id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_recipe_notes_updated_at
  BEFORE UPDATE ON public.recipe_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();