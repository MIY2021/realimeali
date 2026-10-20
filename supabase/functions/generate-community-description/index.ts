
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

async function requireUser(req: Request, functionName: string, limit = 20): Promise<Response | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const serviceUrl = Deno.env.get("SUPABASE_URL"); const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceUrl || !serviceKey) return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const client = createClient(serviceUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: userData, error: userError } = await client.auth.getUser(authHeader.slice(7));
  if (userError || !userData.user) return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const { data: allowed, error: rateError } = await client.rpc("consume_edge_function_rate_limit", { p_user_id: userData.user.id, p_function_name: functionName, p_limit: limit, p_window_seconds: 60 });
  if (rateError) { console.error("Rate limit check failed", { functionName, code: rateError.code }); return new Response(JSON.stringify({ error: "Temporarily unavailable" }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const authFailure = await requireUser(req, "generate-community-description", 10);
  if (authFailure) return authFailure;

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

    const contentLength = Number(req.headers.get("content-length") || "0");
    if (contentLength > 10000) return new Response(JSON.stringify({ error: "Request is too large" }), { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { recipeTitle, originalDescription, sourceUrl } = await req.json();
    if (typeof recipeTitle !== "string" || !recipeTitle.trim()) return new Response(JSON.stringify({ error: "Recipe title is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (recipeTitle.length > 200 || (originalDescription != null && (typeof originalDescription !== "string" || originalDescription.length > 3000)) || (sourceUrl != null && (typeof sourceUrl !== "string" || sourceUrl.length > 2048))) {
      return new Response(JSON.stringify({ error: "One or more fields are too long or invalid" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!recipeTitle) {
      return new Response(
        JSON.stringify({ error: 'Recipe title is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const safeRecipeTitle = recipeTitle.trim();
    const safeOriginalDescription = typeof originalDescription === 'string' ? originalDescription.trim().slice(0, 2000) : '';
    console.log('Generating AI recipe description', { titleLength: safeRecipeTitle.length });

    // Create a prompt that generates an original description based on the recipe title
    const prompt = `Write a compelling, original 2-3 sentence description for a recipe called "${safeRecipeTitle}". 
    ${safeOriginalDescription ? `Reference context: ${safeOriginalDescription.substring(0, 200)}...` : ''}
    
    The description should be:
    - Completely original and copyright-safe
    - Appetizing and engaging
    - Focused on what makes this dish special
    - 2-3 sentences maximum
    - Written in a friendly, inviting tone
    
    Do not copy any text from the reference context. Create entirely new, original content that describes why someone would want to make this recipe.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a food writer creating original, appetizing recipe descriptions. Never copy existing text - always create completely new, original content.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI description generation failed', { status: response.status });
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedDescription = data.choices[0]?.message?.content?.trim();

    if (!generatedDescription) {
      throw new Error('No description generated from OpenAI');
    }

    console.log('AI description generated successfully');

    return new Response(
      JSON.stringify({ 
        description: generatedDescription,
        message: 'AI description generated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Description generation failed', { errorType: error instanceof Error ? error.name : 'UnknownError' });
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate description. Please try again later.',
        details: 'Please try again later'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
