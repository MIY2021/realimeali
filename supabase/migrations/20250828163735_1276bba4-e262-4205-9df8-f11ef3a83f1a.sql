-- Create imported_recipes table with identical structure to recipes table
CREATE TABLE public.imported_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  instructions TEXT[] NOT NULL DEFAULT '{}',
  prep_time INTEGER DEFAULT 0,
  cook_time INTEGER DEFAULT 0,
  servings INTEGER DEFAULT 1,
  image TEXT,
  meal_type meal_type,
  meal_types TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
  cuisine_region cuisine_region,
  diet_lifestyle diet_lifestyle_type[],
  cooking_method cooking_method_type,
  source_url TEXT,
  import_method TEXT DEFAULT 'admin_import',
  top_tip TEXT,
  fruit_veg_portions NUMERIC,
  fruit_veg_breakdown TEXT,
  fruit_veg_ingredient_breakdown JSONB,
  fruit_veg_recommendations JSONB,
  fruit_veg_total_grams NUMERIC,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  priority_score INTEGER DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  add_count INTEGER NOT NULL DEFAULT 0,
  imported_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recipe import logs table for tracking import activities
CREATE TABLE public.recipe_import_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  imported_by UUID NOT NULL,
  total_records INTEGER NOT NULL DEFAULT 0,
  successful_imports INTEGER NOT NULL DEFAULT 0,
  failed_imports INTEGER NOT NULL DEFAULT 0,
  import_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.imported_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_import_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for imported_recipes
CREATE POLICY "Anyone can view imported recipes" 
ON public.imported_recipes 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can create imported recipes" 
ON public.imported_recipes 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update imported recipes" 
ON public.imported_recipes 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete imported recipes" 
ON public.imported_recipes 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for recipe_import_logs
CREATE POLICY "Admins can view import logs" 
ON public.recipe_import_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create import logs" 
ON public.recipe_import_logs 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin') AND auth.uid() = imported_by);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_imported_recipes_updated_at
BEFORE UPDATE ON public.imported_recipes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_imported_recipes_meal_types ON public.imported_recipes USING GIN(meal_types);
CREATE INDEX idx_imported_recipes_diet_lifestyle ON public.imported_recipes USING GIN(diet_lifestyle);
CREATE INDEX idx_imported_recipes_featured_priority ON public.imported_recipes (is_featured DESC, priority_score DESC, created_at DESC);
CREATE INDEX idx_imported_recipes_cuisine ON public.imported_recipes (cuisine_region);
CREATE INDEX idx_recipe_import_logs_imported_by ON public.recipe_import_logs (imported_by, created_at DESC);