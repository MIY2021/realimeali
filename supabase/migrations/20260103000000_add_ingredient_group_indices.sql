-- Add ingredient_group_indices column to recipes table
-- This stores which ingredient indices are group headers (as identified by AI parsing or user)
ALTER TABLE public.recipes 
ADD COLUMN ingredient_group_indices INTEGER[] DEFAULT NULL;

