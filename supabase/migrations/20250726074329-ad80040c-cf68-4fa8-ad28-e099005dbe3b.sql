-- Add columns to store detailed fruit/veg analysis breakdown
ALTER TABLE public.recipes 
ADD COLUMN fruit_veg_breakdown TEXT,
ADD COLUMN fruit_veg_ingredient_breakdown JSONB,
ADD COLUMN fruit_veg_recommendations JSONB,
ADD COLUMN fruit_veg_total_grams NUMERIC;