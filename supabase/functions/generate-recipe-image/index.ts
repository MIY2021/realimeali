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

    console.log('Generating recipe image with OpenAI GPT Image 1 Mini:', prompt);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1-mini',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'low',
        output_format: 'webp',
        output_compression: 80,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI image API error:', response.status, errorData);

      if (response.status === 429) {
        throw new Error('OpenAI image generation is temporarily rate limited. Please try again shortly.');
      }

      if (response.status === 402) {
        throw new Error('OpenAI API billing is unavailable. Please check your API balance.');
      }

      throw new Error(`OpenAI image API error: ${response.status}`);
    }

    const data = await response.json();

    const base64Image = data.data?.[0]?.b64_json;

    if (!base64Image) {
      throw new Error('No image data returned from OpenAI');
    }

    console.log('Image generated, now decoding and uploading to Supabase storage...');

    const binaryString = atob(base64Image);
    const imageBuffer = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      imageBuffer[i] = binaryString.charCodeAt(i);
    }

    const imageSizeBytes = imageBuffer.length;
    const imageSizeMB = (imageSizeBytes / (1024 * 1024)).toFixed(2);
    console.log(`Generated image size: ${imageSizeMB}MB`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const timestamp = Date.now();
    const prefix = isCommunityRecipe ? 'community-recipe' : 'recipe';
    const fileName = `${prefix}-generated-${timestamp}.webp`;

    const { error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/webp',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(fileName);

    console.log('Image uploaded successfully to Supabase storage');

    return new Response(
      JSON.stringify({
        imageUrl: urlData.publicUrl,
        fileName,
        prompt,
        fileSize: imageSizeBytes,
        fileSizeMB: imageSizeMB,
        model: 'gpt-image-1-mini',
        quality: 'low',
        size: '1024x1024',
        format: 'webp',
        provider: 'openai'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-recipe-image function:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to generate image',
        details: 'Please try again later'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
