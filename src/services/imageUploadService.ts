import { supabase } from '@/integrations/supabase/client';
import { compressImage, generateThumbnail } from '@/utils/imageCompression';

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
