-- Create a function to run ingredient category migrations
-- This function can be called from Edge Functions to execute the migrations
CREATE OR REPLACE FUNCTION public.run_ingredient_category_migrations(migration_number TEXT DEFAULT 'both')
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  result JSON;
  migration1_result TEXT;
  migration2_result TEXT;
BEGIN
  result := '{"migration1": {}, "migration2": {}}'::JSON;

  -- Migration 1: Create ingredient_categories table
  IF migration_number = '1' OR migration_number = 'both' THEN
    BEGIN
      -- Create table if not exists
      CREATE TABLE IF NOT EXISTS public.ingredient_categories (
        id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        ingredient_name TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      );

      -- Create index
      CREATE INDEX IF NOT EXISTS idx_ingredient_categories_name ON public.ingredient_categories(ingredient_name);

      -- Create trigger if function exists
      IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        DROP TRIGGER IF EXISTS update_ingredient_categories_updated_at ON public.ingredient_categories;
        CREATE TRIGGER update_ingredient_categories_updated_at
        BEFORE UPDATE ON public.ingredient_categories
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
      END IF;

      -- Enable RLS
      ALTER TABLE public.ingredient_categories ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Anyone can view ingredient categories" ON public.ingredient_categories;
      DROP POLICY IF EXISTS "Authenticated users can insert ingredient categories" ON public.ingredient_categories;
      DROP POLICY IF EXISTS "Authenticated users can update ingredient categories" ON public.ingredient_categories;

      -- Create policies
      CREATE POLICY "Anyone can view ingredient categories" 
      ON public.ingredient_categories 
      FOR SELECT 
      USING (true);

      CREATE POLICY "Authenticated users can insert ingredient categories" 
      ON public.ingredient_categories 
      FOR INSERT 
      WITH CHECK (auth.role() = 'authenticated');

      CREATE POLICY "Authenticated users can update ingredient categories" 
      ON public.ingredient_categories 
      FOR UPDATE 
      USING (auth.role() = 'authenticated');

      migration1_result := 'success';
    EXCEPTION WHEN OTHERS THEN
      migration1_result := 'error: ' || SQLERRM;
    END;
  END IF;

  -- Migration 2: Add category column to household_shopping_lists
  IF migration_number = '2' OR migration_number = 'both' THEN
    BEGIN
      ALTER TABLE public.household_shopping_lists
      ADD COLUMN IF NOT EXISTS category TEXT;

      CREATE INDEX IF NOT EXISTS idx_shopping_lists_category 
      ON public.household_shopping_lists(household_id, category);

      migration2_result := 'success';
    EXCEPTION WHEN OTHERS THEN
      migration2_result := 'error: ' || SQLERRM;
    END;
  END IF;

  -- Build result JSON
  result := json_build_object(
    'migration1', json_build_object(
      'success', migration1_result = 'success',
      'message', CASE WHEN migration1_result = 'success' THEN 'Migration 1 completed successfully' ELSE migration1_result END
    ),
    'migration2', json_build_object(
      'success', migration2_result = 'success',
      'message', CASE WHEN migration2_result = 'success' THEN 'Migration 2 completed successfully' ELSE migration2_result END
    )
  );

  RETURN result;
END;
$$;

-- Automatically run both migrations when this function is created
SELECT public.run_ingredient_category_migrations('both');
