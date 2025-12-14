import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { Image } from 'https://deno.land/x/imagescript@1.3.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ThumbnailResult {
  recipeId: string;
  title: string;
  success: boolean;
  error?: string;
}

/**
 * Resize image to thumbnail size using imagescript library (works in Deno edge functions)
 */
async function resizeImageToThumbnail(imageBlob: Blob, maxWidth: number = 400, maxHeight: number = 400): Promise<Blob> {
  try {
    const arrayBuffer = await imageBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Decode image
    const image = await Image.decode(uint8Array);
    
    // Calculate new dimensions
    let width = image.width;
    let height = image.height;
    
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    
    // Resize
    image.resize(width, height);
    
    // Encode as JPEG with quality 80
    const resized = await image.encode(1); // 1 = JPEG format
    
    return new Blob([resized], { type: 'image/jpeg' });
  } catch (error) {
    console.warn('⚠️ Image resize failed, using original blob:', error);
    // Fallback: return original blob (better than nothing)
    return imageBlob;
  }
}

async function generateThumbnailFromUrl(imageUrl: string): Promise<Blob> {
  console.log(`📥 Downloading image from: ${imageUrl}`);
  
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  
  const blob = await response.blob();
  console.log(`📦 Downloaded blob size: ${(blob.size / 1024).toFixed(2)}KB`);
  
  // Resize to thumbnail
  const thumbnailBlob = await resizeImageToThumbnail(blob, 400, 400);
  console.log(`📦 Thumbnail size: ${(thumbnailBlob.size / 1024).toFixed(2)}KB`);
  
  return thumbnailBlob;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Finding recipes without thumbnails...');
    
    const { data: recipes, error: fetchError } = await supabase
      .from('recipes')
      .select('id, title, image, user_id')
      .not('image', 'is', null)
      .is('image_thumbnail', null)
      .eq('is_deleted', false)
      .limit(50);

    if (fetchError) {
      throw fetchError;
    }

    if (!recipes || recipes.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No recipes found without thumbnails',
          processed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Found ${recipes.length} recipes to process`);
    
    const results: ThumbnailResult[] = [];
    let successCount = 0;
    let failCount = 0;

    for (const recipe of recipes) {
      try {
        console.log(`\n🖼️  Processing: ${recipe.title} (${recipe.id})`);
        
        // Download the existing image (works for both external URLs and Storage URLs)
        const imageBlob = await generateThumbnailFromUrl(recipe.image);
        
        const timestamp = Date.now();
        
        // Check if image is already in Supabase storage
        const isStorageUrl = recipe.image.includes('.supabase.co/storage/v1/object/public/recipe-images/');
        let finalImageUrl = recipe.image;
        
        // Only upload full image if it's not already in storage (external URL)
        if (!isStorageUrl) {
          const fullPath = `${recipe.user_id}/${recipe.id}-${timestamp}.jpg`;
          console.log(`📤 Uploading full image to: ${fullPath}`);
          
          const { error: fullUploadError } = await supabase.storage
            .from('recipe-images')
            .upload(fullPath, imageBlob, {
              contentType: 'image/jpeg',
              upsert: true,
            });

          if (fullUploadError) {
            throw fullUploadError;
          }

          // Get public URL for full image
          const { data: fullData } = supabase.storage
            .from('recipe-images')
            .getPublicUrl(fullPath);
          
          finalImageUrl = fullData.publicUrl;
        } else {
          console.log(`✓ Image already in storage, skipping full image upload`);
        }

        // Resize and upload thumbnail
        const thumbnailBlob = await resizeImageToThumbnail(imageBlob, 400, 400);
        const thumbnailPath = `${recipe.user_id}/${recipe.id}-${timestamp}-thumb.jpg`;
        console.log(`📤 Uploading resized thumbnail (${(thumbnailBlob.size / 1024).toFixed(2)}KB) to: ${thumbnailPath}`);
        
        const { error: thumbError } = await supabase.storage
          .from('recipe-images')
          .upload(thumbnailPath, thumbnailBlob, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (thumbError) {
          throw thumbError;
        }

        // Get public URL for thumbnail
        const { data: thumbData } = supabase.storage
          .from('recipe-images')
          .getPublicUrl(thumbnailPath);

        // Update recipe with thumbnail URL (and full image URL if it was external)
        const updateData: any = { 
          image_thumbnail: thumbData.publicUrl 
        };
        
        if (!isStorageUrl) {
          updateData.image = finalImageUrl;
        }
        
        const { error: updateError } = await supabase
          .from('recipes')
          .update(updateData)
          .eq('id', recipe.id);

        if (updateError) {
          throw updateError;
        }

        console.log(`✅ Successfully migrated images for: ${recipe.title}`);
        
        results.push({
          recipeId: recipe.id,
          title: recipe.title,
          success: true,
        });
        
        successCount++;

      } catch (error) {
        console.error(`❌ Failed to process ${recipe.title}:`, error);
        
        results.push({
          recipeId: recipe.id,
          title: recipe.title,
          success: false,
          error: error.message,
        });
        
        failCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📦 Total processed: ${recipes.length}`);

    return new Response(
      JSON.stringify({
        message: 'Thumbnail generation complete',
        summary: {
          total: recipes.length,
          successful: successCount,
          failed: failCount,
        },
        results,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Error in thumbnail generation:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString() 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
