
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
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
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
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

    console.log('Generating image with Gemini via Lovable AI:', prompt);

    // Generate image with Gemini via Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          { role: 'user', content: prompt }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Lovable AI error:', errorData);
      
      // Handle specific error codes
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 402) {
        throw new Error('Lovable AI credits exhausted. Please add credits to your workspace.');
      }
      
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract base64 image from Gemini response
    const base64Image = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!base64Image) {
      throw new Error('No image data returned from Lovable AI');
    }

    console.log('Image generated, now decoding and uploading to Supabase storage...');

    // Base64 format: "data:image/png;base64,iVBORw0KGg..."
    // Extract the base64 data after the comma
    const base64Data = base64Image.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid base64 image data received');
    }

    // Decode base64 to binary
    const binaryString = atob(base64Data);
    const imageBuffer = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      imageBuffer[i] = binaryString.charCodeAt(i);
    }
    
    // Check file size and log results
    const imageSizeBytes = imageBuffer.length;
    const imageSizeMB = (imageSizeBytes / (1024 * 1024)).toFixed(2);
    console.log(`Downloaded image size: ${imageSizeMB}MB`);

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

    console.log('Image uploaded successfully to Supabase storage');

    return new Response(
      JSON.stringify({ 
        imageUrl: urlData.publicUrl,
        fileName: fileName,
        prompt: prompt,
        fileSize: imageSizeBytes,
        fileSizeMB: imageSizeMB,
        model: 'google/gemini-2.5-flash-image-preview',
        format: 'webp',
        provider: 'lovable-ai'
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
