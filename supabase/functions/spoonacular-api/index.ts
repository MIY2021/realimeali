
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SpoonacularRecipe {
  id: number;
  title: string;
  image?: string;
  readyInMinutes?: number;
  servings?: number;
  sourceUrl?: string;
  summary?: string;
  extendedIngredients?: Array<{
    original: string;
    name: string;
    amount: number;
    unit: string;
  }>;
  analyzedInstructions?: Array<{
    steps: Array<{
      number: number;
      step: string;
    }>;
  }>;
  diets?: string[];
  cuisines?: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, query, number = 12, diet, cuisine, type, maxReadyTime } = await req.json();
    const apiKey = '38986299f4e8460b9696171e6cc0c95c';

    console.log('Spoonacular API request:', { action, query, number, diet, cuisine, type, maxReadyTime });

    let response;
    let recipes: SpoonacularRecipe[] = [];

    if (action === 'search') {
      // Search for recipes
      const searchParams = new URLSearchParams({
        apiKey,
        number: number.toString(),
        addRecipeInformation: 'true',
        fillIngredients: 'true',
      });

      if (query) searchParams.append('query', query);
      if (diet) searchParams.append('diet', diet);
      if (cuisine) searchParams.append('cuisine', cuisine);
      if (type) searchParams.append('type', type);
      if (maxReadyTime) searchParams.append('maxReadyTime', maxReadyTime.toString());

      const searchUrl = `https://api.spoonacular.com/recipes/complexSearch?${searchParams}`;
      console.log('Making request to:', searchUrl);

      response = await fetch(searchUrl);
      const data = await response.json();
      recipes = data.results || [];

    } else if (action === 'popular') {
      // Get popular/random recipes
      const popularUrl = `https://api.spoonacular.com/recipes/random?apiKey=${apiKey}&number=${number}`;
      console.log('Making request to:', popularUrl);

      response = await fetch(popularUrl);
      const data = await response.json();
      recipes = data.recipes || [];

    } else if (action === 'details') {
      // Get detailed recipe information
      const { recipeId } = await req.json();
      const detailsUrl = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`;
      
      response = await fetch(detailsUrl);
      const recipe = await response.json();
      recipes = [recipe];
    }

    if (!response?.ok) {
      throw new Error(`Spoonacular API error: ${response?.status}`);
    }

    // Cache recipes in our database for faster future access
    if (recipes.length > 0) {
      const recipesToCache = recipes.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        ready_in_minutes: recipe.readyInMinutes,
        servings: recipe.servings,
        source_url: recipe.sourceUrl,
        summary: recipe.summary,
        ingredients: JSON.stringify(recipe.extendedIngredients || []),
        instructions: JSON.stringify(recipe.analyzedInstructions || []),
        diet_tags: recipe.diets || [],
        cuisine_types: recipe.cuisines || []
      }));

      // Insert or update cached recipes
      await supabase
        .from('spoonacular_recipes')
        .upsert(recipesToCache, { onConflict: 'id' });
    }

    console.log(`Successfully processed ${recipes.length} recipes`);

    return new Response(
      JSON.stringify({ recipes }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in spoonacular-api function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
