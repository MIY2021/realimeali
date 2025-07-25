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

    // Prepare prompt for OpenAI with detailed NHS guidelines
    const ingredientsList = ingredients.join('\n');
    const prompt = `Analyze the following recipe ingredients and estimate how many NHS "5 A Day" fruit and vegetable portions this recipe provides per serving.

NHS 5 A Day Guidelines (1 portion = 80g):

FRUIT PORTIONS:
- Small fresh fruit: 2+ pieces (2 plums, 2 satsumas, 2 kiwi, 3 apricots, 6 lychees, 7 strawberries, 14 cherries)
- Medium fresh fruit: 1 piece (1 apple, banana, pear, orange, nectarine)  
- Large fresh fruit: 1/2 grapefruit, 1 slice papaya, 1 slice melon (5cm), 1 large slice pineapple, 2 slices mango (5cm)
- Dried fruit: 30g (1 heaped tbsp raisins/sultanas, 1 tbsp mixed fruit, 2 figs, 3 prunes)
- Tinned/frozen fruit: same as fresh quantities

VEGETABLE PORTIONS:
- Green vegetables: 2 broccoli spears, 2 heaped tbsp cooked spinach, 4 heaped tbsp kale/spring greens/green beans
- Cooked vegetables: 3 heaped tbsp (carrots, peas, sweetcorn), 8 cauliflower florets
- Salad vegetables: 3 celery sticks, 5cm cucumber, 1 medium tomato, 7 cherry tomatoes
- Pulses/beans: 3 heaped tbsp (max 1 portion total regardless of amount)
- Onions: 1 medium onion = ~1 portion, garlic doesn't count unless substantial

EXCLUSIONS:
- Potatoes, yams, cassava, plantain (starchy foods)
- Herbs and spices (unless substantial quantities like fresh herb salads)
- Fruit juice/smoothies (limited to 1 portion max total)

Ingredients for ${servings} servings:
${ingredientsList}

Provide detailed analysis with precise reasoning based on NHS guidelines above:

{
  "ingredientBreakdown": [
    {
      "ingredient": "specific ingredient name from list",
      "estimatedGrams": number,
      "portions": number,
      "reasoning": "detailed explanation referencing NHS guidelines (e.g. '1 medium onion = 80g = 1 portion per NHS guidelines')"
    }
  ],
  "summary": "concise explanation of calculation method and total",
  "totalGrams": number,
  "portions": number,
  "recommendations": [
    {
      "suggestion": "specific food to add",
      "portionIncrease": number,
      "reasoning": "why this complements the meal"
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
            content: 'You are a nutrition expert specializing in NHS 5 A Day guidelines. Provide accurate estimates of fruit and vegetable portions in recipes. Always return valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
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
      recommendations: result.recommendations || [],
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