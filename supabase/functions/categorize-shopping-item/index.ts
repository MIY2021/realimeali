import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

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

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const authFailure = await requireUser(req, "categorize-shopping-item", 30);
  if (authFailure) return authFailure;

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { itemName } = await req.json();

    if (!itemName) {
      return new Response(JSON.stringify({ error: 'Item name is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
            content: `You are a grocery categorization expert. Classify grocery items into one of these categories or return a specific match if the item is iconic:

Categories: vegetables, fruits, meat, seafood, dairy, eggs, bakery, frozen, pantry, spices, beverages, snacks, condiments

Specific matches for iconic items: pizza, bread, pasta, rice, milk, cheese, butter, wine, beer, coffee, tea

Rules:
- Return only the category name or specific match in lowercase
- For quantities like "2 lbs chicken breast", focus on the main ingredient
- For compound items, pick the primary ingredient
- If uncertain, use the closest category`
          },
          {
            role: 'user',
            content: `Classify this grocery item: "${itemName}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 50,
      }),
    });

    const data = await response.json();
    const category = data.choices[0]?.message?.content?.trim().toLowerCase() || 'misc';

    return new Response(JSON.stringify({ category }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in categorize-shopping-item function:', error);
    return new Response(JSON.stringify({ error: 'Failed to categorize item', category: 'misc' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});