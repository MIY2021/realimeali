-- Add column to track who made the last update to recipes
ALTER TABLE public.recipes ADD COLUMN last_updated_by UUID REFERENCES auth.users(id);

-- Update existing recipes to set last_updated_by to the original creator
UPDATE public.recipes SET last_updated_by = user_id WHERE last_updated_by IS NULL;

-- Create or replace trigger function to automatically set last_updated_by on updates
CREATE OR REPLACE FUNCTION public.update_recipe_updater()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update last_updated_by on recipe updates
CREATE TRIGGER update_recipe_updater_trigger
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_recipe_updater();