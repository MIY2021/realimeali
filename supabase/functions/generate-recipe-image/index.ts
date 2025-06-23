
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

    const { prompt, isCommunityRecipe = false } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Generating high-quality image with clean prompt:', prompt);

    // Use the prompt directly without double-wrapping or adding redundant prefixes
    const cleanPrompt = prompt;

    console.log('Using clean prompt for gpt-image-1:', cleanPrompt);

    // Generate image with OpenAI gpt-image-1 with optimized settings
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: cleanPrompt,
        n: 1,
        size: '1024x1024', // Keep current resolution
        quality: 'medium', // Keep current quality level
        output_format: 'webp', // Use WebP for better compression
        output_compression: 85, // Optimize quality/size balance
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    
    // gpt-image-1 returns base64 data directly
    const base64ImageData = data.data[0]?.b64_json;

    if (!base64ImageData) {
      throw new Error('No image data returned from OpenAI');
    }

    console.log('Image generated with gpt-image-1, now uploading to Supabase storage...');

    // Convert base64 to buffer
    const imageBuffer = Uint8Array.from(atob(base64ImageData), c => c.charCodeAt(0));
    
    // Check file size and log optimization results
    const imageSizeBytes = imageBuffer.length;
    const imageSizeMB = (imageSizeBytes / (1024 * 1024)).toFixed(2);
    console.log(`Generated image size: ${imageSizeMB}MB`);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate unique filename
    const timestamp = Date.now();
    const prefix = isCommunityRecipe ? 'community-recipe' : 'recipe';
    const fileName = `${prefix}-generated-${timestamp}.webp`;

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/webp',
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

    console.log('High-quality image uploaded successfully to Supabase storage');

    return new Response(
      JSON.stringify({ 
        imageUrl: urlData.publicUrl,
        fileName: fileName,
        prompt: cleanPrompt,
        fileSize: imageSizeBytes,
        fileSizeMB: imageSizeMB,
        model: 'gpt-image-1',
        format: 'webp',
        compression: 85
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
