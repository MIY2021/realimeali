
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
            content: `You are a grocery categorization and ingredient formatting expert. Given an ingredient name, you need to:
1. Categorize it into ONE of these exact categories
2. Create a clean, shopping list-ready version of the ingredient name

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

CLEANED INGREDIENT NAME RULES:
- Keep quantities and measurements exactly as written (e.g., "4", "2–3 tbsp", "1/2 cup")
- Remove descriptive text after commas (e.g., "thinly sliced, green and white parts separated" → remove)
- Remove parenthetical notes (e.g., "(add more/less depending on how spicy you like it)" → remove)
- Capitalize each word properly (Title Case)
- Fix spelling mistakes
- Keep units and measurements with proper formatting (e.g., "tbsp", "cup", "g", "kg")
- NEVER change the ingredient itself (e.g., "cheese" must stay "cheese", never change to "duck" or anything else)
- Preserve the core ingredient name exactly as it is, just clean up formatting and remove extra descriptions

Examples:
- "4 salad onions, thinly sliced, green and white parts separated" → cleanedName: "4 Salad Onions"
- "2–3 tbsp good quality jerk seasoning (add more/less depending on how spicy you like it)" → cleanedName: "2–3 tbsp Good Quality Jerk Seasoning"
- "G cheddar cheese, grated" → cleanedName: "G Cheddar Cheese"
- "1 cup all-purpose flour" → cleanedName: "1 Cup All-Purpose Flour"

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
