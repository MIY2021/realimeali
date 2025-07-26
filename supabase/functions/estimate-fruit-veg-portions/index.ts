import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipeId, ingredients, servings = 1 } = await req.json();

    if (!recipeId || !ingredients || !Array.isArray(ingredients)) {
      return new Response(JSON.stringify({ error: 'Recipe ID and ingredients array are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if we already have an estimation for this recipe
    const { data: existingRecipe } = await supabase
      .from('recipes')
      .select('fruit_veg_portions, fruit_veg_breakdown, fruit_veg_ingredient_breakdown, fruit_veg_recommendations, fruit_veg_total_grams')
      .eq('id', recipeId)
      .single();

    if (existingRecipe?.fruit_veg_portions !== null) {
      return new Response(JSON.stringify({ 
        portions: existingRecipe.fruit_veg_portions,
        breakdown: existingRecipe.fruit_veg_breakdown,
        perServingAnalysis: existingRecipe.fruit_veg_ingredient_breakdown || [],
        contributingIngredients: [], // Legacy data - will be generated fresh on next call
        referencedIngredients: [], // Legacy data - will be generated fresh on next call  
        recommendations: existingRecipe.fruit_veg_recommendations || [],
        totalGrams: existingRecipe.fruit_veg_total_grams,
        cached: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare per-serving focused prompt
    const ingredientsList = ingredients.join('\n');
    const prompt = `CRITICAL: Calculate NHS 5 A Day portions PER SERVING, not for the full recipe.

Recipe serves ${servings} people. You MUST divide all weights by ${servings} first.

NHS Rules:
- 1 portion = 80g per serving
- ≥80g per serving = 1 portion, 40-79g per serving = 0.5 portions, <40g per serving = 0 portions
- Maximum 1 portion per ingredient type per serving
- Exclude: potatoes, herbs, spices, garlic, pasta, cheese, oils
- Be conservative with processed foods (marinara sauce = mostly water/paste, very little actual vegetable content)

CALCULATION PROCESS:
1. Estimate total recipe weight for each vegetable
2. DIVIDE BY ${servings} to get per-serving weight  
3. Apply NHS portion rules to per-serving weight

Conservative estimates for this ${servings}-serving recipe:
${ingredientsList}

Example calculation:
- If recipe has 2 cups spinach (60g total) ÷ ${servings} servings = ${Math.round(60/servings)}g per serving = 0 portions (under 40g threshold)
- If recipe has 1 large zucchini (150g total) ÷ ${servings} servings = ${Math.round(150/servings)}g per serving = ${Math.round(150/servings) >= 80 ? '1' : Math.round(150/servings) >= 40 ? '0.5' : '0'} portions

Return JSON showing PER-SERVING analysis:

{
  "perServingAnalysis": [
    {
      "ingredient": "ingredient name",
      "totalGrams": number,
      "perServingGrams": number,
      "cappedPortions": number,
      "reasoning": "total weight ÷ ${servings} servings = Xg per serving = Y portions"
    }
  ],
  "contributingIngredients": [
    {
      "ingredient": "name",
      "portions": number,
      "grams": number
    }
  ],
  "referencedIngredients": [
    {
      "ingredient": "name", 
      "actualPortions": number,
      "grams": number,
      "reason": "why excluded or too small per serving"
    }
  ],
  "summary": "conservative per-serving summary",
  "totalPortionsPerServing": number,
  "totalGramsPerServing": number,
  "recommendations": [
    {
      "suggestion": "Add fresh tomatoes (150g total)",
      "portionIncrease": 1.0,
      "reasoning": "150g ÷ ${servings} = ${Math.round(150/servings)}g per serving = additional portion"
    },
    {
      "suggestion": "Include more leafy greens like baby spinach",
      "portionIncrease": 0.5,
      "reasoning": "Boost vegetable content per serving"
    },
    {
      "suggestion": "Add diced carrots or sweet potato",
      "portionIncrease": 1.0,
      "reasoning": "Root vegetables add substantial portions when divided by servings"
    }
  ]
}`;

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
            content: `You are a conservative nutrition expert following NHS 5 A Day guidelines. CRITICAL: Always calculate PER SERVING by dividing total recipe amounts by ${servings} servings first. 80g per serving = 1 portion, max 1 portion per ingredient type per serving. Return valid JSON with per-serving calculations only.` 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    // Validate and sanitize the per-serving result
    let portions = parseFloat(result.totalPortionsPerServing) || 0;
    portions = Math.max(0, Math.min(5, portions)); // Clamp between 0 and 5
    portions = Math.round(portions * 2) / 2; // Round to nearest 0.5

    // Update the recipe with the enhanced analysis data
    const { error: updateError } = await supabase
      .from('recipes')
      .update({ 
        fruit_veg_portions: portions,
        fruit_veg_breakdown: result.summary,
        fruit_veg_ingredient_breakdown: result.perServingAnalysis || [],
        fruit_veg_recommendations: result.recommendations || [],
        fruit_veg_total_grams: result.totalGramsPerServing
      })
      .eq('id', recipeId);

    if (updateError) {
      console.error('Error updating recipe:', updateError);
    }

    console.log(`Estimated ${portions} fruit/veg portions per serving for recipe ${recipeId}`);
    console.log('AI Analysis Result:', {
      totalPortionsPerServing: result.totalPortionsPerServing,
      perServingAnalysis: result.perServingAnalysis,
      summary: result.summary
    });

    return new Response(JSON.stringify({ 
      portions,
      breakdown: result.summary,
      perServingAnalysis: result.perServingAnalysis || [],
      contributingIngredients: result.contributingIngredients || [],
      referencedIngredients: result.referencedIngredients || [],
      recommendations: result.recommendations || [],
      totalGrams: result.totalGramsPerServing,
      cached: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in estimate-fruit-veg-portions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});