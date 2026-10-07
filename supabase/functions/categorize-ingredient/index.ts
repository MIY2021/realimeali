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
            content: `You are a grocery categorization and supermarket search-name expert.

Given a recipe ingredient, return:
1. ONE exact category from the allowed list.
2. A concise canonical ingredient name suitable for searching a UK supermarket.

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

CANONICAL NAME RULES:
- Remove quantities and measurements. Quantity is handled separately by the app.
- Remove preparation instructions and cooking notes such as chopped, diced, sliced, grated, peeled, crushed, halved, rinsed and drained.
- Remove parenthetical instructions and instructional text after commas.
- Remove generic shopping noise such as small, medium, large, good quality, high quality and nice.
- Keep the actual food/product identity.
- KEEP meaningful product characteristics that affect what a shopper should buy: smoked paprika, light coconut milk, frozen spinach, skinless chicken thighs, 5% fat beef mince, red pepper, etc.
- Do not turn an ingredient into a different ingredient.
- Do not invent a brand.
- Use normal UK supermarket terminology and simple Title Case.

Examples:
- "Small red onion" -> "Red Onion"
- "2 large carrots, peeled" -> "Carrots"
- "400g 5% fat beef mince" -> "5% Fat Beef Mince"
- "1 cup light coconut milk" -> "Light Coconut Milk"
- "500g frozen spinach" -> "Frozen Spinach"
- "4 salad onions, thinly sliced" -> "Salad Onions"
- "2-3 tbsp good quality jerk seasoning" -> "Jerk Seasoning"

Return JSON with exactly "category" and "cleanedName".`
          },
          {
            role: 'user',
            content: `Categorize and clean this ingredient: ${ingredient}`
          }
        ],
        temperature: 0.1,
        max_tokens: 150,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    const category = result.category?.trim();
    const cleanedName = result.cleanedName?.trim() || ingredient;

    console.log(`Categorized "${ingredient}" as "${category}" with cleaned name "${cleanedName}"`);

    return new Response(JSON.stringify({ category, cleanedName }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in categorize-ingredient function:', error);
    return new Response(JSON.stringify({
      error: error.message,
      category: 'Other',
      cleanedName: ingredient
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
