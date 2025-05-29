
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
    const { content, type = 'text' } = await req.json();

    console.log('Parse recipe request:', { type, contentLength: content?.length });

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'text') {
      systemPrompt = `You are a recipe parsing assistant. Extract recipe information from text and classify it across 6 dimensions. 

Return a JSON object with this EXACT structure:
{
  "title": "Recipe name",
  "description": "Brief description (1-2 sentences)",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": ["step 1", "step 2"],
  "topTip": "One helpful cooking tip",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "classification": {
    "mealType": "dinner",
    "cuisineRegion": "italian", 
    "cookingMethod": "oven_baked",
    "dietLifestyle": ["vegetarian"],
    "complexityLevel": "standard",
    "mainIngredient": "pasta"
  }
}

Classification options:
- mealType: breakfast, lunch, dinner, snacks, sides, desserts, drinks, sauces_dips, soups_stews, salads, baking_breads
- cuisineRegion: british, american, italian, french, mexican, indian, chinese, japanese, thai, mediterranean, middle_eastern, african, korean, caribbean, nordic, eastern_european  
- cookingMethod: one_pot, oven_baked, air_fryer, slow_cooker, pressure_cooker, bbq_grilled, stir_fried, roasted, raw_no_cook
- dietLifestyle: vegetarian, vegan, pescatarian, gluten_free, dairy_free, low_carb_keto, high_protein, paleo, diabetic_friendly, budget_meals, kid_friendly, pregnancy_safe (can be multiple)
- complexityLevel: quick_easy, standard, complex
- mainIngredient: chicken, beef, pork, lamb, fish, tofu_tempeh, eggs, cheese, pasta, rice, lentils_beans, vegetables, potatoes, fruit, nuts_seeds, chocolate

Return ONLY valid JSON. No explanations.`;

      userPrompt = `Parse this recipe text and classify it:\n\n${content}`;
    } else if (type === 'generate') {
      systemPrompt = `You are a creative recipe generator. Create an original recipe based on the user's request and classify it across 6 dimensions.

Return a JSON object with this EXACT structure:
{
  "title": "Recipe name",
  "description": "Brief description (1-2 sentences)", 
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": ["step 1", "step 2"],
  "topTip": "One helpful cooking tip",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "classification": {
    "mealType": "dinner",
    "cuisineRegion": "italian",
    "cookingMethod": "oven_baked", 
    "dietLifestyle": ["vegetarian"],
    "complexityLevel": "standard",
    "mainIngredient": "pasta"
  }
}

Classification options:
- mealType: breakfast, lunch, dinner, snacks, sides, desserts, drinks, sauces_dips, soups_stews, salads, baking_breads
- cuisineRegion: british, american, italian, french, mexican, indian, chinese, japanese, thai, mediterranean, middle_eastern, african, korean, caribbean, nordic, eastern_european
- cookingMethod: one_pot, oven_baked, air_fryer, slow_cooker, pressure_cooker, bbq_grilled, stir_fried, roasted, raw_no_cook  
- dietLifestyle: vegetarian, vegan, pescatarian, gluten_free, dairy_free, low_carb_keto, high_protein, paleo, diabetic_friendly, budget_meals, kid_friendly, pregnancy_safe (can be multiple)
- complexityLevel: quick_easy, standard, complex
- mainIngredient: chicken, beef, pork, lamb, fish, tofu_tempeh, eggs, cheese, pasta, rice, lentils_beans, vegetables, potatoes, fruit, nuts_seeds, chocolate

Create realistic recipes with proper ingredient amounts and detailed cooking steps. Return ONLY valid JSON.`;

      userPrompt = `Generate a recipe for: ${content}`;
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: type === 'generate' ? 0.8 : 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content_text = data.choices[0].message.content;

    console.log('OpenAI response received, parsing JSON...');

    try {
      const parsedRecipe = JSON.parse(content_text);
      
      // Validate and clean the response
      const cleanedRecipe = {
        title: parsedRecipe.title || 'Untitled Recipe',
        description: parsedRecipe.description || '',
        ingredients: Array.isArray(parsedRecipe.ingredients) ? parsedRecipe.ingredients : [],
        instructions: Array.isArray(parsedRecipe.instructions) ? parsedRecipe.instructions : [],
        topTip: parsedRecipe.topTip || 'Enjoy cooking this delicious recipe!',
        prepTime: Math.max(0, parseInt(parsedRecipe.prepTime) || 0),
        cookTime: Math.max(0, parseInt(parsedRecipe.cookTime) || 0),
        servings: Math.max(1, parseInt(parsedRecipe.servings) || 1),
        // Include classification
        mealType: parsedRecipe.classification?.mealType,
        cuisineRegion: parsedRecipe.classification?.cuisineRegion,
        cookingMethod: parsedRecipe.classification?.cookingMethod,
        dietLifestyle: Array.isArray(parsedRecipe.classification?.dietLifestyle) 
          ? parsedRecipe.classification.dietLifestyle 
          : [],
        complexityLevel: parsedRecipe.classification?.complexityLevel,
        mainIngredient: parsedRecipe.classification?.mainIngredient,
      };

      console.log('Recipe parsed successfully:', {
        title: cleanedRecipe.title,
        classification: parsedRecipe.classification
      });

      return new Response(JSON.stringify(cleanedRecipe), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.log('Raw content:', content_text);
      
      // Return a fallback response
      return new Response(JSON.stringify({
        error: 'Failed to parse recipe',
        rawResponse: content_text
      }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in parse-recipe-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
