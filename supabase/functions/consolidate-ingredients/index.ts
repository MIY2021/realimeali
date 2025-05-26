
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
      console.error('OpenAI API key not configured, falling back to basic consolidation');
      return basicConsolidation(ingredients);
    }

    console.log('Consolidating ingredients with OpenAI:', ingredients.length);

    const prompt = `
You are an expert at consolidating cooking ingredients. Parse this list and consolidate similar ingredients into single entries.

Rules:
1. Group similar items: "garlic", "garlic cloves", "cloves of garlic" should become one entry
2. Add quantities when possible (e.g., "2 cloves garlic" + "3 cloves garlic" = "5 cloves garlic")
3. Use standard units: cloves, cups, tablespoons, teaspoons, pounds, ounces, pieces
4. If units can't be combined, pick the most common unit and estimate
5. Clean ingredient names (remove extra words, standardize)
6. CRITICAL: ONLY group ingredients that are truly the same ingredient (e.g., don't group "diced tomatoes" with "fresh tomatoes")
7. CRITICAL: Preserve the EXACT recipe IDs and names from the input for each ingredient
8. Each consolidated ingredient should only include recipe IDs where that specific ingredient actually appears

Input ingredients with their recipe context:
${ingredients.map(ing => `- "${ing.name}" (Recipe: ${ing.recipeTitle}, ID: ${ing.recipeId})`).join('\n')}

Return ONLY a JSON array with this exact structure:
[
  {
    "name": "garlic",
    "consolidatedQuantity": 5,
    "consolidatedUnit": "cloves",
    "sourceIngredients": ["2 cloves garlic", "3 garlic cloves"],
    "recipeIds": ["recipe1", "recipe2"],
    "recipeNames": ["Recipe 1", "Recipe 2"]
  }
]

Important: 
- Return only valid JSON, no other text
- Use the EXACT recipe IDs and names from the input
- Only consolidate ingredients that are actually the same ingredient
- Keep recipe attribution accurate - only include recipes that actually use each ingredient`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that consolidates cooking ingredients while preserving accurate recipe attribution. Always return valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      return basicConsolidation(ingredients);
    }

    const data = await response.json();
    const consolidatedText = data.choices[0].message.content;
    
    console.log('OpenAI response:', consolidatedText);

    let consolidatedIngredients: ConsolidatedIngredient[];
    try {
      consolidatedIngredients = JSON.parse(consolidatedText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response, falling back to basic consolidation:', parseError);
      return basicConsolidation(ingredients);
    }

    // Validate the consolidated ingredients to ensure recipe attribution is correct
    const result = consolidatedIngredients.map(item => {
      // Ensure recipe IDs are unique and exist in the original input
      const validRecipeIds = [...new Set(item.recipeIds)].filter(id => 
        ingredients.some(ing => ing.recipeId === id)
      );
      
      // Get corresponding recipe names for the valid IDs
      const validRecipeNames = validRecipeIds.map(id => {
        const ing = ingredients.find(ing => ing.recipeId === id);
        return ing ? ing.recipeTitle : '';
      }).filter(Boolean);

      return {
        ...item,
        recipeIds: validRecipeIds,
        recipeNames: validRecipeNames
      };
    });

    console.log('Successfully consolidated', ingredients.length, 'ingredients into', result.length, 'items');

    return new Response(JSON.stringify({ consolidatedIngredients: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in consolidate-ingredients function:', error);
    
    try {
      const { ingredients } = await req.json() as { ingredients: IngredientInput[] };
      return basicConsolidation(ingredients);
    } catch (fallbackError) {
      console.error('Fallback consolidation failed:', fallbackError);
      return new Response(JSON.stringify({ error: 'Consolidation failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }
});

function basicConsolidation(ingredients: IngredientInput[]): Response {
  console.log('Using basic consolidation fallback');
  
  // Group ingredients by recipe to avoid cross-contamination
  const byRecipe = new Map<string, IngredientInput[]>();
  ingredients.forEach(ing => {
    if (!byRecipe.has(ing.recipeId)) {
      byRecipe.set(ing.recipeId, []);
    }
    byRecipe.get(ing.recipeId)!.push(ing);
  });

  const result: ConsolidatedIngredient[] = [];
  
  // Process each ingredient individually to maintain accurate recipe attribution
  ingredients.forEach(ingredient => {
    const words = ingredient.name.toLowerCase().trim().split(/\s+/);
    let key = words[0];
    
    // Basic ingredient normalization
    if (words.includes('garlic') || words.includes('cloves')) key = 'garlic';
    else if (words.includes('onion') || words.includes('onions')) key = 'onion';
    else if (words.includes('tomato') || words.includes('tomatoes')) key = 'tomato';
    else if (words.includes('oil') && words.includes('olive')) key = 'olive oil';
    else if (words.includes('salt')) key = 'salt';
    else if (words.includes('pepper')) key = 'pepper';
    else if (words.length >= 2) key = `${words[0]} ${words[1]}`;

    // Check if we already have this ingredient from the same recipe
    const existingIndex = result.findIndex(item => 
      item.name === key && item.recipeIds.includes(ingredient.recipeId)
    );

    if (existingIndex >= 0) {
      // Add to existing entry
      result[existingIndex].sourceIngredients.push(ingredient.name);
      result[existingIndex].consolidatedQuantity = result[existingIndex].sourceIngredients.length;
    } else {
      // Create new entry
      result.push({
        name: key,
        consolidatedQuantity: 1,
        consolidatedUnit: '',
        sourceIngredients: [ingredient.name],
        recipeIds: [ingredient.recipeId],
        recipeNames: [ingredient.recipeTitle]
      });
    }
  });

  console.log('Basic consolidation result:', result.length, 'items');

  return new Response(JSON.stringify({ consolidatedIngredients: result }), {
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
  });
}
