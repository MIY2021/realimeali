
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
            content: `You are a grocery categorization and shopping-list formatting expert. Given a recipe ingredient, return:
1. ONE exact grocery category from the list below
2. A canonical supermarket-ready ingredient name

CATEGORIES (return ONLY one):
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
- Remove quantities and measurements from the beginning: "400g chicken breast" → "Chicken Breast"; "2 tbsp smoked paprika" → "Smoked Paprika".
- Remove preparation instructions and cooking notes: "chopped", "diced", "sliced", "grated", "rinsed", "to serve", etc.
- Remove parenthetical notes and text after commas when it is preparation/instructional text.
- Preserve product-defining characteristics that help someone choose the right supermarket product: "smoked paprika", "light coconut milk", "5% fat beef mince", "frozen spinach", "skinless chicken thighs".
- Preserve meaningful size/count descriptors when they define the product, such as "large eggs".
- Fix obvious spelling/capitalisation issues.
- Do NOT change the ingredient into a different ingredient.
- Return only the core product/ingredient name, not recipe instructions.

Examples:
- "4 salad onions, thinly sliced, green and white parts separated" → cleanedName: "Salad Onions"
- "2–3 tbsp good quality jerk seasoning" → cleanedName: "Jerk Seasoning"
- "400g 5% fat beef mince" → cleanedName: "5% Fat Beef Mince"
- "1 cup light coconut milk" → cleanedName: "Light Coconut Milk"
- "500g frozen spinach" → cleanedName: "Frozen Spinach"

Return a JSON object with both "category" and "cleanedName" fields.`
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
    const content = JSON.parse(data.choices[0].message.content);
    const category = content.category?.trim();
    const cleanedName = content.cleanedName?.trim() || ingredient; // Fallback to original if missing
    
    console.log(`Categorized "${ingredient}" as "${category}" with cleaned name "${cleanedName}"`);

    return new Response(JSON.stringify({ category, cleanedName }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in categorize-ingredient function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      category: 'Other', // Fallback category
      cleanedName: ingredient // Fallback to original ingredient
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
