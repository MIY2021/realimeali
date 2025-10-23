-- Create recipe-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for recipe-images bucket
CREATE POLICY "Authenticated users can upload recipe images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'recipe-images');

CREATE POLICY "Anyone can view recipe images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'recipe-images');

CREATE POLICY "Users can update their own recipe images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'recipe-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own recipe images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'recipe-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add thumbnail column to recipes table
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS image_thumbnail text;

-- Add comments explaining the columns
COMMENT ON COLUMN recipes.image IS 'Full resolution image URL (from storage or external)';
COMMENT ON COLUMN recipes.image_thumbnail IS 'Thumbnail image URL for list views (~400x400)';