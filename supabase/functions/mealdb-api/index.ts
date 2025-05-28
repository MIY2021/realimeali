
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MealDBRecipe {
  idMeal: string;
  strMeal: string;
  strDrinkAlternate?: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags?: string;
  strYoutube?: string;
  strIngredient1?: string;
  strIngredient2?: string;
  strIngredient3?: string;
  strIngredient4?: string;
  strIngredient5?: string;
  strIngredient6?: string;
  strIngredient7?: string;
  strIngredient8?: string;
  strIngredient9?: string;
  strIngredient10?: string;
  strIngredient11?: string;
  strIngredient12?: string;
  strIngredient13?: string;
  strIngredient14?: string;
  strIngredient15?: string;
  strIngredient16?: string;
  strIngredient17?: string;
  strIngredient18?: string;
  strIngredient19?: string;
  strIngredient20?: string;
  strMeasure1?: string;
  strMeasure2?: string;
  strMeasure3?: string;
  strMeasure4?: string;
  strMeasure5?: string;
  strMeasure6?: string;
  strMeasure7?: string;
  strMeasure8?: string;
  strMeasure9?: string;
  strMeasure10?: string;
  strMeasure11?: string;
  strMeasure12?: string;
  strMeasure13?: string;
  strMeasure14?: string;
  strMeasure15?: string;
  strMeasure16?: string;
  strMeasure17?: string;
  strMeasure18?: string;
  strMeasure19?: string;
  strMeasure20?: string;
  strSource?: string;
  strImageSource?: string;
  strCreativeCommonsConfirmed?: string;
  dateModified?: string;
}

interface ProcessedRecipe {
  id: string;
  title: string;
  image?: string;
  category: string;
  area: string;
  instructions: string[];
  ingredients: string[];
  tags?: string[];
  sourceUrl?: string;
  videoUrl?: string;
  readyInMinutes?: number;
  servings?: number;
  diets?: string[];
  cuisines?: string[];
}

function processIngredients(meal: MealDBRecipe): string[] {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}` as keyof MealDBRecipe];
    const measure = meal[`strMeasure${i}` as keyof MealDBRecipe];
    
    if (ingredient && ingredient.trim()) {
      const fullIngredient = measure && measure.trim() 
        ? `${measure.trim()} ${ingredient.trim()}`
        : ingredient.trim();
      ingredients.push(fullIngredient);
    }
  }
  return ingredients;
}

function processInstructions(instructions: string): string[] {
  // Split by common instruction separators
  return instructions
    .split(/\r?\n|\.(?=\s*[A-Z])|(?:\d+\.)\s*/)
    .map(step => step.trim())
    .filter(step => step.length > 10); // Filter out very short steps
}

function processRecipe(meal: MealDBRecipe): ProcessedRecipe {
  return {
    id: meal.idMeal,
    title: meal.strMeal,
    image: meal.strMealThumb,
    category: meal.strCategory,
    area: meal.strArea,
    instructions: processInstructions(meal.strInstructions),
    ingredients: processIngredients(meal),
    tags: meal.strTags ? meal.strTags.split(',').map(tag => tag.trim()) : [],
    sourceUrl: meal.strSource,
    videoUrl: meal.strYoutube,
    readyInMinutes: 30, // Default since MealDB doesn't provide time
    servings: 4, // Default since MealDB doesn't provide servings
    diets: [], // We'll infer this from ingredients/tags if needed
    cuisines: [meal.strArea],
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, number = 12, category, area } = await req.json();

    console.log('MealDB API request:', { action, query, number, category, area });

    let response;
    let recipes: ProcessedRecipe[] = [];

    if (action === 'search') {
      // Search for recipes by name
      if (query) {
        const searchUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
        console.log('Making request to:', searchUrl);
        
        response = await fetch(searchUrl);
        const data = await response.json();
        
        if (data.meals) {
          recipes = data.meals.slice(0, number).map(processRecipe);
        }
      } else if (category) {
        const categoryUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`;
        console.log('Making request to:', categoryUrl);
        
        response = await fetch(categoryUrl);
        const data = await response.json();
        
        if (data.meals) {
          recipes = data.meals.slice(0, number).map(processRecipe);
        }
      } else if (area) {
        const areaUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(area)}`;
        console.log('Making request to:', areaUrl);
        
        response = await fetch(areaUrl);
        const data = await response.json();
        
        if (data.meals) {
          recipes = data.meals.slice(0, number).map(processRecipe);
        }
      }

    } else if (action === 'random') {
      // Get random recipes
      const randomRecipes = [];
      for (let i = 0; i < number; i++) {
        const randomUrl = 'https://www.themealdb.com/api/json/v1/1/random.php';
        console.log('Making request to:', randomUrl);
        
        const randomResponse = await fetch(randomUrl);
        const randomData = await randomResponse.json();
        
        if (randomData.meals && randomData.meals[0]) {
          randomRecipes.push(processRecipe(randomData.meals[0]));
        }
      }
      recipes = randomRecipes;

    } else if (action === 'details') {
      // Get detailed recipe information
      const detailsUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${req.recipeId}`;
      
      response = await fetch(detailsUrl);
      const data = await response.json();
      
      if (data.meals && data.meals[0]) {
        recipes = [processRecipe(data.meals[0])];
      }
    }

    if (response && !response.ok) {
      throw new Error(`MealDB API error: ${response.status}`);
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
    console.error('Error in mealdb-api function:', error);
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
