
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

    console.log('Consolidating ingredients with enhanced OpenAI:', ingredients.length);

    const prompt = `
You are an expert at consolidating cooking ingredients with enhanced fraction handling. Parse this list and consolidate similar ingredients into single entries.

ENHANCED RULES FOR FRACTION SCALING:
1. When scaling fractions, always check if the result becomes a cleaner whole number
2. Examples of proper fraction scaling:
   - "½ tin pineapple" × 2 = "1 tin pineapple" (NOT "2 ½ tin pineapple")
   - "¼ cup flour" × 4 = "1 cup flour" (NOT "4 ¼ cup flour")
   - "⅓ tsp salt" × 3 = "1 tsp salt" (NOT "3 ⅓ tsp salt")
3. For complex ingredients with multiple quantities, scale each part separately:
   - "½ tin pineapple chunks, plus 2 tbsp juice" × 2 = "1 tin pineapple chunks, plus 4 tbsp juice"
4. Use Unicode fractions (½, ¼, ¾, ⅓, ⅔) when appropriate for display
5. Recognize that "2 ½" looks confusing - use "1" when it's actually a whole unit

CONSOLIDATION RULES:
1. Group similar items: "garlic", "garlic cloves", "cloves of garlic" should become one entry
2. Add quantities when possible and scale fractions intelligently
3. Use standard units: cloves, cups, tablespoons, teaspoons, pounds, ounces, pieces, tins, cans
4. If units can't be combined, pick the most common unit and estimate
5. Clean ingredient names (remove extra words, standardize)
6. CRITICAL: ONLY group ingredients that are truly the same ingredient
7. CRITICAL: Preserve the EXACT recipe IDs and names from the input for each ingredient
8. Each consolidated ingredient should only include recipe IDs where that specific ingredient actually appears
9. Handle complex ingredient descriptions (with commas, "plus", "and") by scaling all parts

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
- Keep recipe attribution accurate - only include recipes that actually use each ingredient
- Apply intelligent fraction scaling to avoid confusing displays like "2 ½ tin"`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that consolidates cooking ingredients with enhanced fraction handling while preserving accurate recipe attribution. Always return valid JSON.' },
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
    
    console.log('Enhanced OpenAI response:', consolidatedText);

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

    console.log('Successfully consolidated with enhanced fraction handling:', ingredients.length, 'ingredients into', result.length, 'items');

    return new Response(JSON.stringify({ consolidatedIngredients: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in enhanced consolidate-ingredients function:', error);
    
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
  console.log('Using enhanced basic consolidation fallback');
  
  // Enhanced fraction mapping for basic consolidation
  const fractionMap: { [key: string]: number } = {
    '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 0.333, '⅔': 0.667,
    '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875,
    '1/2': 0.5, '1/4': 0.25, '3/4': 0.75, '1/3': 0.333, '2/3': 0.667
  };

  const result: ConsolidatedIngredient[] = [];
  
  // Process each ingredient with enhanced parsing
  ingredients.forEach(ingredient => {
    const words = ingredient.name.toLowerCase().trim().split(/\s+/);
    let key = words.join(' ');
    let quantity = 1;
    
    // Enhanced ingredient normalization with fraction awareness
    const firstWord = words[0];
    if (fractionMap[firstWord]) {
      quantity = fractionMap[firstWord];
      key = words.slice(1).join(' ');
    } else if (/^\d+/.test(firstWord)) {
      const match = firstWord.match(/^(\d+(?:\.\d+)?)/);
      if (match) {
        quantity = parseFloat(match[1]);
        key = words.slice(1).join(' ');
      }
    }
    
    // Basic ingredient grouping with better normalization
    if (key.includes('garlic') || key.includes('cloves')) key = 'garlic';
    else if (key.includes('onion')) key = 'onion';
    else if (key.includes('tomato')) key = 'tomato';
    else if (key.includes('olive') && key.includes('oil')) key = 'olive oil';
    else if (key.includes('salt')) key = 'salt';
    else if (key.includes('pepper')) key = 'pepper';
    else if (key.includes('tin') || key.includes('can')) {
      // Special handling for tins/cans
      const parts = key.split(/\s+/);
      const relevantParts = parts.filter(p => !['tin', 'can', 'of'].includes(p));
      key = relevantParts.slice(-2).join(' '); // Take last 2 significant words
    }

    // Check if we already have this ingredient from the same recipe
    const existingIndex = result.findIndex(item => 
      item.name === key && item.recipeIds.includes(ingredient.recipeId)
    );

    if (existingIndex >= 0) {
      // Add to existing entry with enhanced quantity handling
      result[existingIndex].sourceIngredients.push(ingredient.name);
      result[existingIndex].consolidatedQuantity += quantity;
    } else {
      // Create new entry
      result.push({
        name: key,
        consolidatedQuantity: quantity,
        consolidatedUnit: '',
        sourceIngredients: [ingredient.name],
        recipeIds: [ingredient.recipeId],
        recipeNames: [ingredient.recipeTitle]
      });
    }
  });

  console.log('Enhanced basic consolidation result:', result.length, 'items');

  return new Response(JSON.stringify({ consolidatedIngredients: result }), {
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
  });
}
