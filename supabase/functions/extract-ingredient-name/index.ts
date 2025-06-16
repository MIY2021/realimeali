
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
    const { ingredientText } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
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
            content: `You are an expert at extracting clean ingredient names from recipe text. Given an ingredient line from a recipe, extract just the core ingredient name without quantities, units, preparation methods, or descriptive terms.

Rules:
- Remove all quantities (numbers, fractions, measurements)
- Remove all units (g, kg, ml, cups, tbsp, etc.)
- Remove preparation methods (chopped, diced, cooked, etc.)
- Remove cooking states (fresh, dried, canned, frozen, etc.)
- Remove descriptive terms (large, small, extra virgin, etc.)
- Remove parenthetical content entirely
- Remove anything after commas that describes preparation
- Keep only the essential food item name
- Capitalize properly (first letter of each word)

Examples:
"400g cooked lentils (or 200g dried lentils, rinsed)" → "Lentils"
"g black or green olives, pitted and halved" → "Black Or Green Olives"
"2 tbsp extra virgin olive oil" → "Olive Oil"
"1 large onion, chopped" → "Onion"
"200ml fresh cream" → "Cream"`
          },
          {
            role: 'user',
            content: `Extract the clean ingredient name from: "${ingredientText}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 50,
      }),
    });

    const data = await response.json();
    const extractedName = data.choices[0].message.content.trim();

    return new Response(JSON.stringify({ extractedName }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in extract-ingredient-name function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
