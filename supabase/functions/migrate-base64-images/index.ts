import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { compressImage, generateThumbnail } from './imageCompression.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MigrationResult {
  success: boolean;
  recipeId: string;
  title: string;
  oldImageSize?: number;
  newImageUrl?: string;
  newThumbnailUrl?: string;
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🚀 Starting base64 image migration...');

    // Query all recipes with base64 images
    const { data: recipes, error: queryError } = await supabase
      .from('recipes')
      .select('id, title, image, user_id')
      .like('image', 'data:image%');

    if (queryError) {
      throw new Error(`Failed to query recipes: ${queryError.message}`);
    }

    if (!recipes || recipes.length === 0) {
      console.log('✅ No base64 images found. Migration complete!');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No base64 images found to migrate',
          results: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Found ${recipes.length} recipes with base64 images`);

    const results: MigrationResult[] = [];
    const batchSize = 5;

    // Process in batches
    for (let i = 0; i < recipes.length; i += batchSize) {
      const batch = recipes.slice(i, i + batchSize);
      console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} recipes)...`);

      const batchPromises = batch.map(async (recipe) => {
        try {
          console.log(`  🔄 Processing: ${recipe.title} (${recipe.id})`);

          if (!recipe.image || !recipe.image.startsWith('data:image')) {
            return {
              success: false,
              recipeId: recipe.id,
              title: recipe.title,
              error: 'No base64 image found',
            };
          }

          // Extract base64 data
          const base64Match = recipe.image.match(/^data:image\/(\w+);base64,(.+)$/);
          if (!base64Match) {
            throw new Error('Invalid base64 format');
          }

          const [, imageType, base64Data] = base64Match;
          const oldImageSize = base64Data.length * 0.75; // Approximate size in bytes

          // Decode base64 to binary
          const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          const blob = new Blob([binaryData], { type: `image/${imageType}` });

          // Create File object for compression
          const file = new File([blob], `${recipe.id}.${imageType}`, { type: `image/${imageType}` });

          // Compress image
          const compressed = await compressImage(file, 1200, 1200, 0.85);
          const thumbnail = await generateThumbnail(file, 400, 400);

          // Upload to storage
          const timestamp = Date.now();
          const fullPath = `${recipe.user_id}/${recipe.id}-migrated-${timestamp}.jpg`;
          const thumbnailPath = `${recipe.user_id}/${recipe.id}-migrated-${timestamp}-thumb.jpg`;

          // Upload full image
          const { error: fullUploadError } = await supabase.storage
            .from('recipe-images')
            .upload(fullPath, compressed.file, {
              contentType: 'image/jpeg',
              upsert: true,
            });

          if (fullUploadError) throw fullUploadError;

          // Upload thumbnail
          const { error: thumbUploadError } = await supabase.storage
            .from('recipe-images')
            .upload(thumbnailPath, thumbnail.file, {
              contentType: 'image/jpeg',
              upsert: true,
            });

          if (thumbUploadError) throw thumbUploadError;

          // Get public URLs
          const { data: fullData } = supabase.storage
            .from('recipe-images')
            .getPublicUrl(fullPath);

          const { data: thumbData } = supabase.storage
            .from('recipe-images')
            .getPublicUrl(thumbnailPath);

          // Update recipe with new URLs
          const { error: updateError } = await supabase
            .from('recipes')
            .update({
              image: fullData.publicUrl,
              image_thumbnail: thumbData.publicUrl,
              updated_at: new Date().toISOString(),
            })
            .eq('id', recipe.id);

          if (updateError) throw updateError;

          console.log(`  ✅ Success: ${recipe.title}`);

          return {
            success: true,
            recipeId: recipe.id,
            title: recipe.title,
            oldImageSize: Math.round(oldImageSize / 1024), // KB
            newImageUrl: fullData.publicUrl,
            newThumbnailUrl: thumbData.publicUrl,
          };
        } catch (error) {
          console.error(`  ❌ Failed: ${recipe.title}`, error);
          return {
            success: false,
            recipeId: recipe.id,
            title: recipe.title,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    // Summary
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    const totalSavedKB = results
      .filter(r => r.success && r.oldImageSize)
      .reduce((sum, r) => sum + (r.oldImageSize || 0), 0);

    console.log('\n📊 Migration Summary:');
    console.log(`  ✅ Successful: ${successCount}`);
    console.log(`  ❌ Failed: ${failCount}`);
    console.log(`  💾 Database size reduced by: ~${Math.round(totalSavedKB / 1024)} MB`);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total: recipes.length,
          successful: successCount,
          failed: failCount,
          savedMB: Math.round(totalSavedKB / 1024),
        },
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
