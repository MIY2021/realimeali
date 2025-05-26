
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IngredientInput {
  name: string;
  recipeId: string;
  recipeTitle: string;
}

interface ConsolidatedIngredient {
  name: string;
  consolidatedQuantity: number;
  consolidatedUnit: string;
  sourceIngredients: string[];
  recipeIds: string[];
  recipeNames: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients } = await req.json() as { ingredients: IngredientInput[] };

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Consolidating ingredients:', ingredients.length);

    const prompt = `
You are an expert at parsing and consolidating cooking ingredients. Given a list of ingredients from various recipes, your task is to:

1. Parse each ingredient to extract quantity, unit, and clean name
2. Group similar ingredients together (e.g., "garlic", "garlic cloves", "cloves of garlic" should all be grouped)
3. Add up quantities where units are compatible
4. Return consolidated ingredients with standardized names and units

Here are the ingredients to consolidate:
${ingredients.map(ing => `- "${ing.name}" (from ${ing.recipeTitle})`).join('\n')}

Please return a JSON array where each object has:
- name: standardized ingredient name (e.g., "garlic", "olive oil", "tomatoes")
- consolidatedQuantity: total quantity needed (as number)
- consolidatedUnit: standardized unit (e.g., "cloves", "cups", "grams", or empty string if unitless)
- sourceIngredients: array of original ingredient strings
- recipeIds: array of recipe IDs that use this ingredient
- recipeNames: array of recipe names

Rules:
- If units can't be consolidated (e.g., "2 cups flour" + "1 tablespoon flour"), keep them separate
- Use common units like "cups", "tablespoons", "teaspoons", "pounds", "ounces", "grams", "pieces", "cloves"
- For items without clear quantities, use quantity 1 and appropriate unit
- Group similar items intelligently (e.g., "fresh basil" and "basil leaves" = "basil")

Return only valid JSON, no other text.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that consolidates cooking ingredients. Always return valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
      }),
    });

    const data = await response.json();
    const consolidatedText = data.choices[0].message.content;
    
    console.log('OpenAI response:', consolidatedText);

    // Parse the JSON response
    let consolidatedIngredients: ConsolidatedIngredient[];
    try {
      consolidatedIngredients = JSON.parse(consolidatedText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      throw new Error('Invalid response format from OpenAI');
    }

    // Map recipe IDs and names to the consolidated ingredients
    const recipeMap = new Map<string, string>();
    ingredients.forEach(ing => {
      recipeMap.set(ing.recipeId, ing.recipeTitle);
    });

    const result = consolidatedIngredients.map(item => ({
      ...item,
      recipeIds: ingredients
        .filter(ing => item.sourceIngredients.some(source => 
          source.toLowerCase().includes(ing.name.toLowerCase()) || 
          ing.name.toLowerCase().includes(item.name.toLowerCase())
        ))
        .map(ing => ing.recipeId),
      recipeNames: ingredients
        .filter(ing => item.sourceIngredients.some(source => 
          source.toLowerCase().includes(ing.name.toLowerCase()) || 
          ing.name.toLowerCase().includes(item.name.toLowerCase())
        ))
        .map(ing => ing.recipeTitle)
    }));

    console.log('Consolidated result:', result);

    return new Response(JSON.stringify({ consolidatedIngredients: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in consolidate-ingredients function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
