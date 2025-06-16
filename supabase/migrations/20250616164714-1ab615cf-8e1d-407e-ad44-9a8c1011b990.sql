
-- Add new columns to community_recipes table to store Unsplash image metadata
ALTER TABLE public.community_recipes 
ADD COLUMN unsplash_image_url text,
ADD COLUMN photographer_name text,
ADD COLUMN photographer_profile_url text,
ADD COLUMN image_source_type text DEFAULT 'ai';

-- Update existing records to have proper image_source_type
UPDATE public.community_recipes 
SET image_source_type = CASE 
  WHEN ai_generated_image_url IS NOT NULL THEN 'ai'
  ELSE 'unknown'
END;
