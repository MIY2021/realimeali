
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

async function requireUser(req: Request, functionName: string, limit = 20): Promise<Response | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const serviceUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceUrl || !serviceKey) return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const client = createClient(serviceUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: userData, error: userError } = await client.auth.getUser(authHeader.slice(7));
  if (userError || !userData.user) return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const { data: allowed, error: rateError } = await client.rpc("consume_edge_function_rate_limit", { p_user_id: userData.user.id, p_function_name: functionName, p_limit: limit, p_window_seconds: 60 });
  if (rateError) {
    console.error("Rate limit check failed", { functionName, code: rateError.code });
    return new Response(JSON.stringify({ error: "Temporarily unavailable" }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  if (allowed !== true) return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  return null;
}


const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const IMAGE_MODEL = 'gpt-image-2.5-flare';

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const imageBuffer = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    imageBuffer[i] = binaryString.charCodeAt(i);
  }
  return imageBuffer;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const authFailure = await requireUser(req, "generate-recipe-image", 5);
  if (authFailure) return authFailure;

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing');
    }

    const contentLength = Number(req.headers.get("content-length") || "0");
    if (contentLength > 20000) return new Response(JSON.stringify({ error: "Request is too large" }), { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { prompt, isCommunityRecipe = false } = await req.json();
    if (typeof prompt !== "string" || !prompt.trim()) return new Response(JSON.stringify({ error: "Prompt is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (prompt.length > 10000) return new Response(JSON.stringify({ error: "Prompt is too long" }), { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (typeof isCommunityRecipe !== "boolean") return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const safePrompt = prompt.trim();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Generating image with OpenAI:', IMAGE_MODEL);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt: safePrompt,
        size: '1024x1024',
        output_format: 'webp',
      }),
      signal: AbortSignal.timeout(90000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;
      console.error('OpenAI image generation failed', { status: response.status });

      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 401) {
        throw new Error('OpenAI API key is invalid. Please update OPENAI_API_KEY.');
      }

      throw new Error(`OpenAI image error: ${response.status}`);
    }

    const data = await response.json();
    const b64Json = data.data?.[0]?.b64_json;
    const imageUrlFromApi = data.data?.[0]?.url;

    let imageBuffer: Uint8Array;

    if (b64Json) {
      const base64Data = b64Json.includes(',') ? b64Json.split(',')[1] : b64Json;
      imageBuffer = decodeBase64(base64Data);
    } else if (imageUrlFromApi) {
      const imageResponse = await fetch(imageUrlFromApi);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download generated image: ${imageResponse.status}`);
      }
      imageBuffer = new Uint8Array(await imageResponse.arrayBuffer());
    } else {
      throw new Error('No image data returned from OpenAI');
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
        fileName: fileName,
        prompt: safePrompt,
        fileSize: imageSizeBytes,
        fileSizeMB: imageSizeMB,
        model: IMAGE_MODEL,
        format: 'webp',
        provider: 'openai',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Image generation failed', { errorType: error instanceof Error ? error.name : 'UnknownError' });
    return new Response(
      JSON.stringify({
        error: 'Failed to generate image. Please try again later.',
        details: 'Please try again later',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
