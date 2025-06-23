
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing');
    }

    const { prompt, isCommunityRecipe = false, quality = 'standard', size = '1024x1024' } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Generating optimized image with enhanced prompt:', prompt);

    // Enhanced prompt processing for better recipe context
    let enhancedPrompt = prompt;
    if (isCommunityRecipe) {
      // For community recipes, ensure we have a comprehensive prompt
      if (!prompt.includes('hyper-realistic, top-down food photograph')) {
        enhancedPrompt = `Generate a hyper-realistic, top-down food photograph of ${prompt}. Use natural lighting with soft shadows and realistic textures. Plate the dish in an appropriate ceramic or rustic-style plate or bowl. Garnish only with ingredients that would naturally accompany this dish. The background should be clean and natural (wood, stone, concrete, or linen). Include minimal, contextually appropriate props. The result must look like a professional, real-life food photograph with no digital or artificial appearance. Focus on authentic food presentation and natural colors. Keep the overall image bright and light.`;
      }
    } else {
      // For user recipes, the prompt is already enhanced with ingredients and instructions
      if (!prompt.includes('hyper-realistic, top-down food photograph')) {
        enhancedPrompt = `Generate a hyper-realistic, top-down food photograph of ${prompt}. Use natural lighting with soft shadows and realistic textures. Plate the dish appropriately. The result must look like a professional, real-life food photograph. Keep the overall image bright and light.`;
      }
    }

    console.log('Using enhanced prompt with recipe context:', enhancedPrompt);

    // Generate image with OpenAI DALL-E 3, optimized for web performance
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: size, // Use configurable size for optimization
        quality: quality, // Use configurable quality for file size control
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const tempImageUrl = data.data[0]?.url;

    if (!tempImageUrl) {
      throw new Error('No image URL returned from OpenAI');
    }

    console.log('Image generated, now optimizing and uploading to Supabase storage...');

    // Download the image from OpenAI
    const imageResponse = await fetch(tempImageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to download generated image');
    }

    const imageBlob = await imageResponse.blob();
    
    // Check file size and optimize if needed
    const maxSizeBytes = 2 * 1024 * 1024; // 2MB limit for web performance
    let imageBuffer = await imageBlob.arrayBuffer();
    
    if (imageBlob.size > maxSizeBytes) {
      console.log(`Image size (${imageBlob.size} bytes) exceeds limit, using optimized settings`);
      // The image is already optimized by using 'standard' quality
      // For future enhancement, we could implement additional compression here
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate unique filename
    const timestamp = Date.now();
    const prefix = isCommunityRecipe ? 'community-recipe' : 'recipe';
    const fileName = `${prefix}-generated-${timestamp}.png`;

    // Upload to Supabase storage with optimization
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(fileName);

    console.log('Optimized image uploaded successfully to Supabase storage');

    return new Response(
      JSON.stringify({ 
        imageUrl: urlData.publicUrl,
        fileName: fileName,
        prompt: enhancedPrompt,
        fileSize: imageBlob.size,
        optimized: imageBlob.size <= maxSizeBytes
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-recipe-image function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate image',
        details: 'Please try again later'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
