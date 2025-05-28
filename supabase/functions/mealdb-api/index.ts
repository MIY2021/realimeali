
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
  if (!instructions) return [];
  
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

async function fetchMealsFromUrl(url: string): Promise<MealDBRecipe[]> {
  console.log('Making request to:', url);
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  
  const data = await response.json();
  return data.meals || [];
}

async function removeDuplicates(recipes: ProcessedRecipe[]): Promise<ProcessedRecipe[]> {
  const seen = new Set();
  return recipes.filter(recipe => {
    if (seen.has(recipe.id)) {
      return false;
    }
    seen.add(recipe.id);
    return true;
  });
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, number = 12, category, area, ingredient, letter } = await req.json();

    console.log('MealDB API request:', { action, query, number, category, area, ingredient, letter });

    let allRecipes: ProcessedRecipe[] = [];

    if (action === 'search') {
      // Enhanced search that tries multiple strategies
      const searchPromises: Promise<MealDBRecipe[]>[] = [];

      // 1. Search by meal name if query provided
      if (query) {
        const nameUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
        searchPromises.push(fetchMealsFromUrl(nameUrl));
      }

      // 2. Search by ingredient if query provided (fallback search)
      if (query) {
        const ingredientUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(query)}`;
        searchPromises.push(fetchMealsFromUrl(ingredientUrl));
      }

      // 3. Search by specific ingredient filter
      if (ingredient) {
        const ingredientUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`;
        searchPromises.push(fetchMealsFromUrl(ingredientUrl));
      }

      // 4. Filter by category
      if (category) {
        const categoryUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`;
        searchPromises.push(fetchMealsFromUrl(categoryUrl));
      }

      // 5. Filter by area
      if (area) {
        const areaUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(area)}`;
        searchPromises.push(fetchMealsFromUrl(areaUrl));
      }

      // 6. Browse by first letter
      if (letter) {
        const letterUrl = `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`;
        searchPromises.push(fetchMealsFromUrl(letterUrl));
      }

      if (searchPromises.length > 0) {
        // Execute all searches in parallel
        const results = await Promise.allSettled(searchPromises);
        
        // Combine successful results
        for (const result of results) {
          if (result.status === 'fulfilled' && result.value) {
            const processedRecipes = result.value.map(processRecipe);
            allRecipes.push(...processedRecipes);
          }
        }

        // Remove duplicates and limit results
        allRecipes = await removeDuplicates(allRecipes);
        allRecipes = allRecipes.slice(0, number);
      }

    } else if (action === 'random') {
      // Get random recipes
      const randomRecipes = [];
      for (let i = 0; i < number; i++) {
        try {
          const meals = await fetchMealsFromUrl('https://www.themealdb.com/api/json/v1/1/random.php');
          if (meals.length > 0) {
            randomRecipes.push(processRecipe(meals[0]));
          }
        } catch (error) {
          console.error('Error fetching random recipe:', error);
        }
      }
      allRecipes = randomRecipes;

    } else if (action === 'details') {
      // Get detailed recipe information
      const detailsUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${req.recipeId}`;
      const meals = await fetchMealsFromUrl(detailsUrl);
      
      if (meals.length > 0) {
        allRecipes = [processRecipe(meals[0])];
      }

    } else if (action === 'ingredients') {
      // Get list of ingredients
      const ingredientsUrl = 'https://www.themealdb.com/api/json/v1/1/list.php?i=list';
      const response = await fetch(ingredientsUrl);
      const data = await response.json();
      
      return new Response(
        JSON.stringify({ ingredients: data.meals || [] }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );

    } else if (action === 'categories') {
      // Get list of categories
      const categoriesUrl = 'https://www.themealdb.com/api/json/v1/1/categories.php';
      const response = await fetch(categoriesUrl);
      const data = await response.json();
      
      return new Response(
        JSON.stringify({ categories: data.categories || [] }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );

    } else if (action === 'areas') {
      // Get list of areas
      const areasUrl = 'https://www.themealdb.com/api/json/v1/1/list.php?a=list';
      const response = await fetch(areasUrl);
      const data = await response.json();
      
      return new Response(
        JSON.stringify({ areas: data.meals || [] }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    console.log(`Successfully processed ${allRecipes.length} recipes`);

    return new Response(
      JSON.stringify({ recipes: allRecipes }),
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
