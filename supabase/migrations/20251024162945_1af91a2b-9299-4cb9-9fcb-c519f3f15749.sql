-- Create validation function to prevent base64 images
CREATE OR REPLACE FUNCTION validate_recipe_image_format()
RETURNS trigger AS $$
BEGIN
  -- Only validate if image is being set (not NULL)
  IF NEW.image IS NOT NULL AND NEW.image LIKE 'data:image%' THEN
    RAISE EXCEPTION 'Base64 images are not allowed. Please upload images to Supabase Storage first. Use the uploadRecipeImage() service to properly store images.';
  END IF;
  
  IF NEW.image_thumbnail IS NOT NULL AND NEW.image_thumbnail LIKE 'data:image%' THEN
    RAISE EXCEPTION 'Base64 thumbnails are not allowed. Please upload images to Supabase Storage first. Use the uploadRecipeImage() service to properly store images.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on INSERT and UPDATE
CREATE TRIGGER enforce_storage_only_images
  BEFORE INSERT OR UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION validate_recipe_image_format();

-- Add helpful comment
COMMENT ON TRIGGER enforce_storage_only_images ON recipes IS 
  'Prevents base64 image data from being stored. All images must be uploaded to Supabase Storage using uploadRecipeImage() service.';