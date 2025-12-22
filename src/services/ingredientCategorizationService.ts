import { supabase } from "@/integrations/supabase/client";
import { IngredientCategory, DEFAULT_INGREDIENT_CATEGORY } from "@/types/ingredientCategories";
import { getCategoryFromGuide } from "@/utils/ingredientCategoryGuide";

/**
 * Gets the category and cleaned name for an ingredient from the database
 * Uses exact match (case-insensitive) - no normalization
 */
async function getCategoryFromDatabase(ingredientText: string): Promise<{
  category: IngredientCategory;
  cleanedName: string;
} | null> {
  try {
    const { data, error } = await supabase
      .from('ingredient_categories')
      .select('category, cleaned_name')
      .eq('ingredient_name', ingredientText.toLowerCase().trim())
      .single();

    if (error) {
      // Not found is not an error - just means we need to categorize it
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching category from database:', error);
      return null;
    }

    if (!data) return null;

    return {
      category: data.category as IngredientCategory,
      cleanedName: data.cleaned_name || ingredientText
    };
  } catch (error) {
    console.error('Error in getCategoryFromDatabase:', error);
    return null;
  }
}

/**
 * Categorizes an ingredient using OpenAI via the Supabase function
 * Falls back to guide list if OpenAI is unavailable
 * Returns both category and cleaned name
 */
async function categorizeWithOpenAI(ingredient: string): Promise<{
  category: IngredientCategory;
  cleanedName: string;
}> {
  // First check the guide as a quick fallback
  const guideCategory = getCategoryFromGuide(ingredient);
  if (guideCategory) {
    return {
      category: guideCategory,
      cleanedName: ingredient // No cleaning if using guide
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke('categorize-ingredient', {
      body: { ingredient }
    });

    if (error) {
      console.error('Error calling categorize-ingredient function:', error);
      // Try guide as fallback
      const fallbackCategory = getCategoryFromGuide(ingredient);
      return {
        category: fallbackCategory || DEFAULT_INGREDIENT_CATEGORY,
        cleanedName: ingredient
      };
    }

    const category = data?.category as IngredientCategory;
    const cleanedName = data?.cleanedName as string || ingredient;
    
    // Validate the category is one of our valid categories
    const validCategories: IngredientCategory[] = [
      "Fruit & Vegetables",
      "Meat & Fish",
      "Chilled Food",
      "Bakery",
      "Frozen Food",
      "Food Cupboard",
      "Snacks & Treats",
      "World & Dietary",
      "Drinks",
      "Alcohol",
      "Other"
    ];

    if (category && validCategories.includes(category)) {
      return { category, cleanedName };
    }

    console.warn(`Invalid category returned from OpenAI: ${category}, using default`);
    // Try guide as fallback
    const fallbackCategory = getCategoryFromGuide(ingredient);
    return {
      category: fallbackCategory || DEFAULT_INGREDIENT_CATEGORY,
      cleanedName: ingredient
    };
  } catch (error) {
    console.error('Error categorizing ingredient with OpenAI:', error);
    // Try guide as fallback
    const fallbackCategory = getCategoryFromGuide(ingredient);
    return {
      category: fallbackCategory || DEFAULT_INGREDIENT_CATEGORY,
      cleanedName: ingredient
    };
  }
}

/**
 * Saves an ingredient category and cleaned name to the database
 * Stores the ingredient exactly as provided (lowercased for consistency)
 * No normalization - exact match lookup
 */
async function saveIngredientCategory(
  ingredientName: string,
  category: IngredientCategory,
  cleanedName?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('ingredient_categories')
      .upsert({
        ingredient_name: ingredientName.toLowerCase().trim(),
        category: category,
        cleaned_name: cleanedName || ingredientName, // Store cleaned name if provided
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'ingredient_name'
      });

    if (error) {
      console.error('Error saving ingredient category:', error);
      throw error; // Throw so caller knows it failed
    }
  } catch (error) {
    console.error('Error in saveIngredientCategory:', error);
    throw error; // Re-throw so caller can handle
  }
}

/**
 * Gets the category and cleaned name for an ingredient, checking database first, then using OpenAI
 * Passes the ingredient text exactly as-is to OpenAI (no normalization)
 * Always saves categorized ingredients to the database to reduce AI usage
 * Returns both category and cleaned shopping list name
 */
export async function getCategoryForIngredient(ingredient: string): Promise<{
  category: IngredientCategory;
  cleanedName: string;
}> {
  // Skip empty or invalid ingredient names
  if (!ingredient || ingredient.trim().length === 0) {
    return {
      category: DEFAULT_INGREDIENT_CATEGORY,
      cleanedName: ingredient
    };
  }

  const ingredientKey = ingredient.toLowerCase().trim();

  // Check database first using exact match (no normalization)
  const dbResult = await getCategoryFromDatabase(ingredient);
  if (dbResult) {
    console.log(`✅ Found category in database for "${ingredient}": ${dbResult.category}`);
    return {
      category: dbResult.category,
      cleanedName: dbResult.cleanedName
    };
  }

  // If not in database, use OpenAI to categorize (passing original text exactly as-is)
  console.log(`🤖 Using AI to categorize "${ingredient}" (not found in database)`);
  const result = await categorizeWithOpenAI(ingredient);
  
  // Save to database for future use to reduce AI calls
  // Store using the original ingredient text (lowercased) as the key
  try {
    await saveIngredientCategory(ingredientKey, result.category, result.cleanedName);
    console.log(`💾 Saved category to database for "${ingredient}": ${result.category}, cleaned name: "${result.cleanedName}"`);
  } catch (err) {
    console.error(`❌ Failed to save category to database for "${ingredient}":`, err);
    // Don't throw - categorization still succeeded, just logging failed
  }

  return result;
}

/**
 * Batch categorizes multiple ingredients
 * Returns a map of ingredient names (lowercased) to categories
 * No normalization - passes ingredients exactly as-is to OpenAI
 * All categorized ingredients are saved to the database to reduce future AI usage
 */
export async function categorizeIngredients(
  ingredients: string[]
): Promise<Map<string, IngredientCategory>> {
  const categoryMap = new Map<string, IngredientCategory>();
  
  // Filter out empty ingredients and section headers
  const validIngredients = ingredients.filter(ing => {
    const trimmed = ing?.trim();
    return trimmed && 
           trimmed.length > 0 && 
           trimmed !== 'undefined' && 
           trimmed !== 'null' &&
           !trimmed.endsWith(':'); // Filter out section headers
  });

  console.log(`📦 Categorizing ${validIngredients.length} ingredients (checking database first, then AI if needed)...`);

  // Process ingredients in parallel (with some rate limiting consideration)
  const categoryPromises = validIngredients.map(async (ingredient) => {
    if (!ingredient || ingredient.trim().length === 0) {
      return null;
    }
    
    const result = await getCategoryForIngredient(ingredient);
    // Use lowercased ingredient as key for the map
    return { ingredientKey: ingredient.toLowerCase().trim(), category: result.category };
  });

  const results = await Promise.allSettled(categoryPromises);
  
  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value) {
      categoryMap.set(result.value.ingredientKey, result.value.category);
    }
  });

  console.log(`✅ Completed categorization for ${categoryMap.size} ingredients`);
  return categoryMap;
}
