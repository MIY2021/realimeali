import { supabase } from '@/integrations/supabase/client';
import { compressImage, generateThumbnail, generateThumbnailFromUrl } from '@/utils/imageCompression';

export interface UploadedImages {
  fullUrl: string;
  thumbnailUrl: string;
  fullPath: string;
  thumbnailPath: string;
}

export async function uploadRecipeImage(
  file: File,
  userId: string,
  recipeId: string
): Promise<UploadedImages> {
  try {
    const timestamp = Date.now();
    
    console.log(`📸 Original file size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    const compressed = await compressImage(file);
    console.log(`📸 Compressed size: ${(compressed.size / 1024).toFixed(2)}KB`);

    const thumbnail = await generateThumbnail(file);
    console.log(`📸 Thumbnail size: ${(thumbnail.size / 1024).toFixed(2)}KB`);

    const fullPath = `${userId}/${recipeId}-${timestamp}.jpg`;
    const { error: fullError } = await supabase.storage
      .from('recipe-images')
      .upload(fullPath, compressed.file, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (fullError) throw fullError;

    const thumbnailPath = `${userId}/${recipeId}-${timestamp}-thumb.jpg`;
    const { error: thumbError } = await supabase.storage
      .from('recipe-images')
      .upload(thumbnailPath, thumbnail.file, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (thumbError) throw thumbError;

    const { data: fullData } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(fullPath);

    const { data: thumbData } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(thumbnailPath);

    return {
      fullUrl: fullData.publicUrl,
      thumbnailUrl: thumbData.publicUrl,
      fullPath,
      thumbnailPath,
    };
  } catch (error) {
    console.error('❌ Error uploading recipe image:', error);
    throw error;
  }
}

/**
 * Generate and upload a thumbnail from an image URL
 * Used when recipes have image URLs but no uploaded file
 */
export async function uploadThumbnailFromUrl(
  imageUrl: string,
  userId: string,
  recipeId: string
): Promise<string> {
  try {
    console.log(`📸 Generating thumbnail from URL: ${imageUrl}`);
    const thumbnail = await generateThumbnailFromUrl(imageUrl);
    console.log(`📸 Thumbnail size: ${(thumbnail.size / 1024).toFixed(2)}KB`);

    const timestamp = Date.now();
    const thumbnailPath = `${userId}/${recipeId}-${timestamp}-thumb.jpg`;
    
    const { error: thumbError } = await supabase.storage
      .from('recipe-images')
      .upload(thumbnailPath, thumbnail.file, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (thumbError) throw thumbError;

    const { data: thumbData } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(thumbnailPath);

    return thumbData.publicUrl;
  } catch (error) {
    console.error('❌ Error uploading thumbnail from URL:', error);
    throw error;
  }
}

/**
 * Regenerate thumbnail for a recipe that has an image but missing or incorrect thumbnail
 * This is useful for fixing existing recipes with mismatched thumbnails
 */
export async function regenerateRecipeThumbnail(
  recipeId: string,
  imageUrl: string,
  userId: string
): Promise<string | null> {
  try {
    console.log(`🔄 Regenerating thumbnail for recipe ${recipeId}...`);
    const thumbnailUrl = await uploadThumbnailFromUrl(imageUrl, userId, recipeId);
    
    // Update the recipe with the new thumbnail
    const { error: updateError } = await supabase
      .from('recipes')
      .update({ image_thumbnail: thumbnailUrl })
      .eq('id', recipeId);
    
    if (updateError) {
      console.error('❌ Failed to update recipe with regenerated thumbnail:', updateError);
      return null;
    }
    
    console.log(`✅ Successfully regenerated thumbnail for recipe ${recipeId}`);
    return thumbnailUrl;
  } catch (error) {
    console.error('❌ Error regenerating thumbnail:', error);
    return null;
  }
}
