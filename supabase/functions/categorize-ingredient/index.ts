import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const validCategories = [
  "Fruit & Vegetables",
  "Meat & Fish",
  "Chilled Food",
  "Bakery",
  "Frozen Food",
  "Food Cupboard",
  "Snacks & Treats",
  "World & Dietary",
  "Drinks",
  "Alcohol",
  "Other"
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredient } = await req.json();

    if (!ingredient) {
      throw new Error('Ingredient name is required');
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
            content: `You are a grocery categorization expert.

Given a recipe ingredient, return exactly one category from the allowed list.

CATEGORIES:
- Fruit & Vegetables
- Meat & Fish
- Chilled Food
- Bakery
- Frozen Food
- Food Cupboard
- Snacks & Treats
- World & Dietary
- Drinks
- Alcohol
- Other

Categorize the ingredient based on what the shopper is actually buying. Do not rewrite, clean, simplify or otherwise modify the ingredient text. The app handles shopping-name normalisation separately.`
          },
          {
            role: 'user',
            content: `Categorize this ingredient: ${ingredient}`
          }
        ],
        temperature: 0.1,
        max_tokens: 50,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    const category = result.category?.trim();

    if (!validCategories.includes(category)) {
      throw new Error(`Invalid category returned: ${category}`);
    }

    return new Response(JSON.stringify({ category }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in categorize-ingredient function:', error);
    return new Response(JSON.stringify({
      error: error.message,
      category: 'Other'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
