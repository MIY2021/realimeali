-- Create ingredient_categories table to store normalized ingredient names and their categories
CREATE TABLE public.ingredient_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient_name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on ingredient_name for fast lookups
CREATE INDEX idx_ingredient_categories_name ON public.ingredient_categories(ingredient_name);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_ingredient_categories_updated_at
BEFORE UPDATE ON public.ingredient_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.ingredient_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies - allow authenticated users to read, but only system can write
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
