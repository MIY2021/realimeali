import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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