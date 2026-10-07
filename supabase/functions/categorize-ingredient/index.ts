
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
- Remove quantities and measurements from the name. Quantity is handled separately by the app.
- Remove preparation instructions and cooking notes: chopped, diced, sliced, grated, peeled, crushed, halved, rinsed, drained, etc.
- Remove parenthetical instructions and text after commas when it is preparation/instructional text.
- Remove generic shopping noise such as "small", "medium", "large", "good quality", "high quality", "nice".
- Keep the actual food/product identity.
- KEEP meaningful product characteristics that affect what a shopper should buy: smoked paprika, light coconut milk, frozen spinach, skinless chicken thighs, 5% fat beef mince, red pepper, etc.
- Do not turn an ingredient into a different ingredient.
- Do not invent a brand.
- Use normal UK supermarket terminology and simple Title Case.
- "Small red onion" should become "Red Onion".
- "2 large carrots, peeled" should become "Carrots".
- "400g 5% fat beef mince" should become "5% Fat Beef Mince".
- "1 cup light coconut milk" should become "Light Coconut Milk".
- "500g frozen spinach" should become "Frozen Spinach".
- "4 salad onions, thinly sliced" should become "Salad Onions".
- "2–3 tbsp good quality jerk seasoning" should become "Jerk Seasoning".

Return JSON with exactly "category" and "cleanedName".`
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
            content: `You are a grocery categorization and ingredient formatting expert. Given an ingredient name, you need to:\n1. Categorize it into ONE of these exact categories\n2. Create a clean, shopping list-ready version of the ingredient name\n\nCATEGORIES (return ONLY one):\n- Fruit & Vegetables\n- Meat & Fish\n- Chilled Food\n- Bakery\n- Frozen Food\n- Food Cupboard\n- Snacks & Treats\n- World & Dietary\n- Drinks\n- Alcohol\n- Other\n\nCLEANED INGREDIENT NAME RULES:\n- Keep quantities and measurements exactly as written (e.g., "4", "2–3 tbsp", "1/2 cup")\n- Remove descriptive text after commas (e.g., "thinly sliced, green and white parts separated" → remove)\n- Remove parenthetical notes (e.g., "(add more/less depending on how spicy you like it)" → remove)\n- Capitalize each word properly (Title Case)\n- Fix spelling mistakes\n- Keep units and measurements with proper formatting (e.g., "tbsp", "cup", "g", "kg")\n- NEVER change the ingredient itself (e.g., "cheese" must stay "cheese", never change to "duck" or anything else)\n- Preserve the core ingredient name exactly as it is, just clean up formatting and remove extra descriptions\n\nExamples:\n- "4 salad onions, thinly sliced, green and white parts separated" → cleanedName: "4 Salad Onions"\n- "2–3 tbsp good quality jerk seasoning (add more/less depending on how spicy you like it)" → cleanedName: "2–3 tbsp Good Quality Jerk Seasoning"\n- "G cheddar cheese, grated" → cleanedName: "G Cheddar Cheese"\n- "1 cup all-purpose flour" → cleanedName: "1 Cup All-Purpose Flour"\n\nReturn a JSON object with both "category" and "cleanedName" fields.`
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
    const cleanedName = content.cleanedName?.trim() || ingredient;
    
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
