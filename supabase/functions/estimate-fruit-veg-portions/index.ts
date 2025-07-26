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

    // Prepare enhanced prompt with comprehensive weight references and NHS guidelines
    const ingredientsList = ingredients.join('\n');
    const prompt = `Analyze the following recipe ingredients using comprehensive weight references and NHS "5 A Day" guidelines. Follow this EXACT process:

STEP 1: ANALYZE TOTAL RECIPE WEIGHTS
First estimate total weight for each fruit/vegetable ingredient using these reference weights:

🍎 FRUITS (avg weight per whole fruit):
Apple: 150–200g | Apricot: 35–50g | Avocado: 150–200g | Banana: 120–150g | Blackberry: 5–10g | Blueberry: 0.5–1g | Cantaloupe: 800–1000g | Cherry: 5–10g | Cranberry: 5–10g | Fig: 35–50g | Grape: 5–10g | Kiwi: 100–150g | Lemon/Lime: 80–100g | Mango: 200–300g | Nectarine/Peach/Pear: 150–200g | Papaya: 500–800g | Pineapple: 1000–1500g | Plum: 59–72g | Raspberry: 3–6g | Strawberry: 10–20g

🥕 VEGETABLES (avg weight per unit):
Beetroot: 150–200g | Broccoli head: 150–200g | Brussels sprout: 10–30g | Cabbage head: 500–800g | Carrot (medium): 60–80g | Cauliflower head: 500–1000g | Celery stalk: 20g (whole bunch ~450g) | Courgette/Zucchini: 100–200g | Cucumber: 150–250g | Aubergine/Eggplant: 200–400g | Mushroom (button): 15–30g | Onion (medium): 100–150g | Bell pepper: 120–180g | Sweet potato: 150–300g | Tomato (medium): 100–150g

COOKING MEASUREMENTS:
- 2 cups fresh spinach ≈ 60g | 1 cup chopped onions ≈ 80g | 2 cups marinara sauce ≈ 480g | 1 cup canned tomatoes ≈ 240g

STEP 2: DIVIDE BY SERVINGS (${servings} servings)
Calculate per-serving weight for each ingredient by dividing total weight by ${servings}.

STEP 3: APPLY NHS GUIDELINES PER SERVING
NHS 5 A Day Guidelines (1 portion = 80g):
- CRITICAL RULE: Maximum 1 portion can be counted per ingredient type per serving, regardless of actual weight
- Use 1/0.5/0 logic: ≥80g = 1 portion, 40-79g = 0.5 portions, <40g = 0 portions
- Exclusions: potatoes, herbs/spices (unless substantial), garlic

STEP 4: BUILD FINAL SCORE
Sum all contributing portions per serving (maximum 1.0 per ingredient type).

Recipe for ${servings} servings:
${ingredientsList}

Return this exact JSON structure with per-serving analysis:

{
  "perServingAnalysis": [
    {
      "ingredient": "ingredient name from list",
      "totalGrams": number,
      "perServingGrams": number,
      "cappedPortions": number,
      "reasoning": "detailed calculation (e.g., '480g marinara sauce ÷ 4 servings = 120g per serving = 1.0 portion (capped at NHS maximum)')"
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
      "reason": "why it doesn't count toward total"
    }
  ],
  "summary": "concise explanation emphasizing per-serving analysis and NHS capping",
  "totalPortionsPerServing": number,
  "totalGramsPerServing": number,
  "recommendations": [
    {
      "suggestion": "specific addition",
      "portionIncrease": number,
      "reasoning": "why this helps"
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
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are a nutrition expert specializing in NHS 5 A Day guidelines. Follow the exact 4-step process: analyze total weights using reference data, divide by servings, apply NHS capping rules (max 1 portion per ingredient), calculate final score. Always return valid JSON with per-serving analysis.' 
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