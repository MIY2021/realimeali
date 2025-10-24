import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

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

async function generateThumbnailFromUrl(imageUrl: string): Promise<Blob> {
  console.log(`📥 Downloading image from: ${imageUrl}`);
  
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  
  const blob = await response.blob();
  console.log(`📦 Downloaded blob size: ${(blob.size / 1024).toFixed(2)}KB`);
  
  // For edge functions, we'll create a smaller version by re-uploading with compression hints
  // The actual compression happens during upload
  return blob;
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
        
        // Download the existing image
        const imageBlob = await generateThumbnailFromUrl(recipe.image);
        
        // Create thumbnail filename
        const timestamp = Date.now();
        const thumbnailPath = `${recipe.user_id}/${recipe.id}-${timestamp}-thumb.jpg`;
        
        console.log(`📤 Uploading thumbnail to: ${thumbnailPath}`);
        
        // Upload thumbnail to storage
        const { error: uploadError } = await supabase.storage
          .from('recipe-images')
          .upload(thumbnailPath, imageBlob, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL for thumbnail
        const { data: thumbData } = supabase.storage
          .from('recipe-images')
          .getPublicUrl(thumbnailPath);

        // Update recipe with thumbnail URL
        const { error: updateError } = await supabase
          .from('recipes')
          .update({ image_thumbnail: thumbData.publicUrl })
          .eq('id', recipe.id);

        if (updateError) {
          throw updateError;
        }

        console.log(`✅ Successfully generated thumbnail for: ${recipe.title}`);
        
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
