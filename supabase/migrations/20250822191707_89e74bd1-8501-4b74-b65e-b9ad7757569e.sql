-- Remove complexity_level column from recipes table
ALTER TABLE public.recipes DROP COLUMN IF EXISTS complexity_level;