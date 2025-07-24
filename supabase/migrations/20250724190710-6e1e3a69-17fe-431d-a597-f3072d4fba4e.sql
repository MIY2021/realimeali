-- Add fruit and vegetable portions estimation to recipes table
ALTER TABLE public.recipes 
ADD COLUMN fruit_veg_portions DECIMAL(2,1) DEFAULT NULL;

-- Add index for better performance when querying recipes with nutrition data
CREATE INDEX idx_recipes_fruit_veg_portions ON public.recipes(fruit_veg_portions) WHERE fruit_veg_portions IS NOT NULL;