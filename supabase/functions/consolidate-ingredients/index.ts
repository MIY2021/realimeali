
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
6. IMPORTANT: Each consolidated item should have UNIQUE recipe IDs (no duplicates)

Ingredients to consolidate:
${ingredients.map(ing => `- "${ing.name}" (from ${ing.recipeTitle}, ID: ${ing.recipeId})`).join('\n')}

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
- Ensure recipeIds arrays contain no duplicates
- Match recipe IDs from the input exactly`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that consolidates cooking ingredients. Always return valid JSON with unique recipe IDs.' },
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

    // Ensure recipe IDs are properly mapped and deduplicated
    const result = consolidatedIngredients.map(item => {
      const matchingIngredients = ingredients.filter(ing => 
        item.sourceIngredients.some(source => 
          source.toLowerCase().includes(ing.name.toLowerCase().split(' ')[0]) ||
          ing.name.toLowerCase().includes(item.name.toLowerCase())
        )
      );

      // Deduplicate recipe IDs and names
      const uniqueRecipeIds = [...new Set(matchingIngredients.map(ing => ing.recipeId))];
      const uniqueRecipeNames = [...new Set(matchingIngredients.map(ing => ing.recipeTitle))];

      return {
        ...item,
        recipeIds: uniqueRecipeIds,
        recipeNames: uniqueRecipeNames
      };
    });

    console.log('Successfully consolidated', ingredients.length, 'ingredients into', result.length, 'items');

    return new Response(JSON.stringify({ consolidatedIngredients: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in consolidate-ingredients function:', error);
    
    // Fallback to basic consolidation on any error
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

// Basic consolidation fallback when OpenAI fails
function basicConsolidation(ingredients: IngredientInput[]): Response {
  console.log('Using basic consolidation fallback');
  
  const grouped = new Map<string, {
    name: string;
    consolidatedQuantity: number;
    consolidatedUnit: string;
    sourceIngredients: string[];
    recipeIds: string[];
    recipeNames: string[];
  }>();

  ingredients.forEach(ingredient => {
    // Simple ingredient name extraction (take first word or first two words)
    const words = ingredient.name.toLowerCase().trim().split(/\s+/);
    let key = words[0];
    
    // Common ingredient groupings
    if (words.includes('garlic') || words.includes('cloves')) key = 'garlic';
    else if (words.includes('onion') || words.includes('onions')) key = 'onion';
    else if (words.includes('tomato') || words.includes('tomatoes')) key = 'tomato';
    else if (words.includes('oil') && words.includes('olive')) key = 'olive oil';
    else if (words.includes('salt')) key = 'salt';
    else if (words.includes('pepper')) key = 'pepper';
    else if (words.length >= 2) key = `${words[0]} ${words[1]}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        name: key,
        consolidatedQuantity: 1,
        consolidatedUnit: '',
        sourceIngredients: [],
        recipeIds: [],
        recipeNames: []
      });
    }

    const group = grouped.get(key)!;
    group.sourceIngredients.push(ingredient.name);
    
    // Deduplicate recipe IDs and names
    if (!group.recipeIds.includes(ingredient.recipeId)) {
      group.recipeIds.push(ingredient.recipeId);
    }
    if (!group.recipeNames.includes(ingredient.recipeTitle)) {
      group.recipeNames.push(ingredient.recipeTitle);
    }
    
    group.consolidatedQuantity = group.sourceIngredients.length; // Simple count
  });

  const result = Array.from(grouped.values());
  console.log('Basic consolidation result:', result.length, 'items');

  return new Response(JSON.stringify({ consolidatedIngredients: result }), {
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
  });
}
