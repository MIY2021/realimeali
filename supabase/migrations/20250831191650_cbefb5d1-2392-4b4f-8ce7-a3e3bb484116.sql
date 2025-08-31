-- Add soft delete columns to recipes table
ALTER TABLE public.recipes 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT false;

-- Create index for better performance on soft delete queries
CREATE INDEX idx_recipes_soft_delete ON public.recipes (is_deleted, deleted_at) WHERE is_deleted = true;

-- Create function to automatically hard delete recipes after 30 days
CREATE OR REPLACE FUNCTION public.cleanup_old_deleted_recipes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.recipes 
  WHERE is_deleted = true 
  AND deleted_at < now() - INTERVAL '30 days';
END;
$$;

-- Create function to soft delete a recipe
CREATE OR REPLACE FUNCTION public.soft_delete_recipe(recipe_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has permission to delete this recipe
  IF NOT EXISTS (
    SELECT 1 FROM public.recipes r
    JOIN public.household_members hm ON r.household_id = hm.household_id
    WHERE r.id = recipe_id AND hm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'User does not have permission to delete this recipe';
  END IF;
  
  UPDATE public.recipes 
  SET is_deleted = true, deleted_at = now(), updated_at = now()
  WHERE id = recipe_id;
END;
$$;

-- Create function to restore a recipe
CREATE OR REPLACE FUNCTION public.restore_recipe(recipe_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has permission to restore this recipe
  IF NOT EXISTS (
    SELECT 1 FROM public.recipes r
    JOIN public.household_members hm ON r.household_id = hm.household_id
    WHERE r.id = recipe_id AND hm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'User does not have permission to restore this recipe';
  END IF;
  
  UPDATE public.recipes 
  SET is_deleted = false, deleted_at = NULL, updated_at = now()
  WHERE id = recipe_id AND is_deleted = true;
END;
$$;

-- Create function to permanently delete a recipe
CREATE OR REPLACE FUNCTION public.permanent_delete_recipe(recipe_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has permission to delete this recipe
  IF NOT EXISTS (
    SELECT 1 FROM public.recipes r
    JOIN public.household_members hm ON r.household_id = hm.household_id
    WHERE r.id = recipe_id AND hm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'User does not have permission to delete this recipe';
  END IF;
  
  -- Delete related data first
  DELETE FROM public.recipe_notes WHERE recipe_id = recipe_id;
  DELETE FROM public.household_recipe_cooking_status WHERE recipe_id = recipe_id;
  DELETE FROM public.household_meal_plans WHERE recipe_id = recipe_id;
  DELETE FROM public.public_recipe_shares WHERE original_recipe_id = recipe_id;
  
  -- Finally delete the recipe
  DELETE FROM public.recipes WHERE id = recipe_id;
END;
$$;