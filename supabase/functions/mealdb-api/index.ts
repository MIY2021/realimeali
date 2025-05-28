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

function filterRecipesWithValidSources(recipes: ProcessedRecipe[]): ProcessedRecipe[] {
  return recipes.filter(recipe => {
    // Only include recipes that have a valid source URL (not just YouTube)
    return recipe.sourceUrl && recipe.sourceUrl.trim() !== '';
  });
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

interface MealDBApiResponse {
  recipes: ProcessedRecipe[];
  totalCount: number;
  hasMore: boolean;
  estimatedTotal?: number;
}

async function fetchAllMealsForSearch(searchParams: {
  category?: string;
  area?: string;
  ingredient?: string;
  query?: string;
}): Promise<{ meals: MealDBRecipe[], totalAvailable: number }> {
  const { category, area, ingredient, query } = searchParams;
  
  let allMeals: MealDBRecipe[] = [];
  let totalAvailable = 0;

  // For specific filters, we can get the complete result set
  if (category && category !== 'all') {
    const meals = await fetchMealsFromUrl(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`);
    allMeals = meals;
    totalAvailable = meals.length;
  } else if (area && area !== 'all') {
    const meals = await fetchMealsFromUrl(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(area)}`);
    allMeals = meals;
    totalAvailable = meals.length;
  } else if (ingredient && ingredient !== 'all') {
    const meals = await fetchMealsFromUrl(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`);
    allMeals = meals;
    totalAvailable = meals.length;
  } else if (query) {
    // For text search, combine name and ingredient searches
    const searchPromises: Promise<MealDBRecipe[]>[] = [];
    
    // Search by name
    const nameUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
    searchPromises.push(fetchMealsFromUrl(nameUrl));
    
    // Search by ingredient as fallback
    const ingredientUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(query)}`;
    searchPromises.push(fetchMealsFromUrl(ingredientUrl));
    
    const results = await Promise.allSettled(searchPromises);
    const combinedMeals = new Map<string, MealDBRecipe>();
    
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        result.value.forEach(meal => combinedMeals.set(meal.idMeal, meal));
      }
    }
    
    allMeals = Array.from(combinedMeals.values());
    totalAvailable = allMeals.length;
  }

  return { meals: allMeals, totalAvailable };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, number = 12, category, area, ingredient, letter, offset = 0 } = await req.json();

    console.log('MealDB API request:', { action, query, number, category, area, ingredient, letter, offset });

    let response: MealDBApiResponse = {
      recipes: [],
      totalCount: 0,
      hasMore: false
    };

    if (action === 'search') {
      const { meals, totalAvailable } = await fetchAllMealsForSearch({
        category: category !== 'all' ? category : undefined,
        area: area !== 'all' ? area : undefined,
        ingredient: ingredient !== 'all' ? ingredient : undefined,
        query: query?.trim() || undefined
      });

      // Process all meals and filter for valid sources
      const processedRecipes = meals.map(processRecipe);
      const validRecipes = filterRecipesWithValidSources(processedRecipes);
      const uniqueRecipes = await removeDuplicates(validRecipes);

      // Apply client-side pagination
      const startIndex = offset;
      const endIndex = startIndex + number;
      const paginatedRecipes = uniqueRecipes.slice(startIndex, endIndex);

      response = {
        recipes: paginatedRecipes,
        totalCount: uniqueRecipes.length,
        hasMore: endIndex < uniqueRecipes.length
      };

    } else if (action === 'random') {
      // For random recipes, we can't get an exact count, but we can estimate
      const randomRecipes = [];
      let attempts = 0;
      const maxAttempts = number * 3;
      
      while (randomRecipes.length < number && attempts < maxAttempts) {
        try {
          const meals = await fetchMealsFromUrl('https://www.themealdb.com/api/json/v1/1/random.php');
          if (meals.length > 0) {
            const processedRecipe = processRecipe(meals[0]);
            if (processedRecipe.sourceUrl && processedRecipe.sourceUrl.trim() !== '') {
              randomRecipes.push(processedRecipe);
            }
          }
        } catch (error) {
          console.error('Error fetching random recipe:', error);
        }
        attempts++;
      }

      response = {
        recipes: randomRecipes,
        totalCount: randomRecipes.length,
        hasMore: true, // Always more random recipes available
        estimatedTotal: 1000 // Estimate for random recipes
      };

    } else if (action === 'details') {
      const detailsUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${req.recipeId}`;
      const meals = await fetchMealsFromUrl(detailsUrl);
      
      if (meals.length > 0) {
        const processedRecipe = processRecipe(meals[0]);
        if (processedRecipe.sourceUrl && processedRecipe.sourceUrl.trim() !== '') {
          response = {
            recipes: [processedRecipe],
            totalCount: 1,
            hasMore: false
          };
        }
      }

    } else if (action === 'ingredients') {
      const ingredientsUrl = 'https://www.themealdb.com/api/json/v1/1/list.php?i=list';
      const ingredientResponse = await fetch(ingredientsUrl);
      const data = await ingredientResponse.json();
      
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
      const categoriesUrl = 'https://www.themealdb.com/api/json/v1/1/categories.php';
      const categoriesResponse = await fetch(categoriesUrl);
      const data = await categoriesResponse.json();
      
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
      const areasUrl = 'https://www.themealdb.com/api/json/v1/1/list.php?a=list';
      const areasResponse = await fetch(areasUrl);
      const data = await areasResponse.json();
      
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

    console.log(`Successfully processed ${response.recipes.length} recipes with valid sources (${response.totalCount} total available)`);

    return new Response(
      JSON.stringify(response),
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
