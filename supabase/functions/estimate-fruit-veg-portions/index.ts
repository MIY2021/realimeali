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
      .select('fruit_veg_portions')
      .eq('id', recipeId)
      .single();

    if (existingRecipe?.fruit_veg_portions !== null) {
      return new Response(JSON.stringify({ 
        portions: existingRecipe.fruit_veg_portions,
        cached: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare prompt for OpenAI
    const ingredientsList = ingredients.join('\n');
    const prompt = `Analyze the following recipe ingredients and estimate how many NHS "5 A Day" fruit and vegetable portions this recipe provides per serving.

Important guidelines:
- 1 portion = 80g of fruit or vegetables
- Count fresh, frozen, canned, dried fruit and vegetables
- Do NOT count potatoes, yams, cassava, or other starchy vegetables
- Do NOT count herbs and spices (unless substantial quantities)
- Consider the quantities mentioned in the ingredients
- This recipe serves ${servings} people, so calculate per serving

Ingredients:
${ingredientsList}

Please provide a detailed analysis with:
1. A list of which specific ingredients count toward 5-a-day and their estimated portions per serving
2. A brief summary explanation
3. Estimated total weight of fruit/veg per serving in grams
4. Final estimate rounded to nearest 0.5 portion (e.g., 1.5, 2.0, 3.5)

Respond in JSON format:
{
  "ingredientBreakdown": [
    {
      "ingredient": "ingredient name",
      "estimatedGrams": number,
      "portions": number,
      "reasoning": "why this counts as X portions"
    }
  ],
  "summary": "brief explanation of total calculation",
  "totalGrams": number,
  "portions": number
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
            content: 'You are a nutrition expert specializing in NHS 5 A Day guidelines. Provide accurate estimates of fruit and vegetable portions in recipes.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    // Validate and sanitize the result
    let portions = parseFloat(result.portions) || 0;
    portions = Math.max(0, Math.min(5, portions)); // Clamp between 0 and 5
    portions = Math.round(portions * 2) / 2; // Round to nearest 0.5

    // Update the recipe with the estimated portions
    const { error: updateError } = await supabase
      .from('recipes')
      .update({ fruit_veg_portions: portions })
      .eq('id', recipeId);

    if (updateError) {
      console.error('Error updating recipe:', updateError);
    }

    console.log(`Estimated ${portions} fruit/veg portions for recipe ${recipeId}`);

    return new Response(JSON.stringify({ 
      portions,
      breakdown: result.summary || result.breakdown,
      ingredientBreakdown: result.ingredientBreakdown || [],
      totalGrams: result.totalGrams,
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