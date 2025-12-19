import { supabase } from "@/integrations/supabase/client";
import { extractIngredientNameFallback } from "@/utils/shoppingListUtils";
import { IngredientCategory, DEFAULT_INGREDIENT_CATEGORY } from "@/types/ingredientCategories";
import { getCategoryFromGuide } from "@/utils/ingredientCategoryGuide";

/**
 * Normalizes an ingredient name by extracting the base ingredient name
 * (removing quantities, units, and descriptive text)
 */
export function normalizeIngredientName(ingredient: string): string {
  // Use the fallback extraction which is synchronous and doesn't require AI
  const normalized = extractIngredientNameFallback(ingredient);
  // Convert to lowercase for consistent storage and lookup
  return normalized.toLowerCase().trim();
}

/**
 * Gets the category for an ingredient from the database
 */
async function getCategoryFromDatabase(ingredientName: string): Promise<IngredientCategory | null> {
  try {
    const { data, error } = await supabase
      .from('ingredient_categories')
      .select('category')
      .eq('ingredient_name', ingredientName.toLowerCase())
      .single();

    if (error) {
      // Not found is not an error - just means we need to categorize it
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching category from database:', error);
      return null;
    }

    return data?.category as IngredientCategory || null;
  } catch (error) {
    console.error('Error in getCategoryFromDatabase:', error);
    return null;
  }
}

/**
 * Categorizes an ingredient using OpenAI via the Supabase function
 * Falls back to guide list if OpenAI is unavailable
 */
async function categorizeWithOpenAI(ingredient: string): Promise<IngredientCategory> {
  // First check the guide as a quick fallback
  const guideCategory = getCategoryFromGuide(ingredient);
  if (guideCategory) {
    return guideCategory;
  }

  try {
    const { data, error } = await supabase.functions.invoke('categorize-ingredient', {
      body: { ingredient }
    });

    if (error) {
      console.error('Error calling categorize-ingredient function:', error);
      // Try guide as fallback
      const fallbackCategory = getCategoryFromGuide(ingredient);
      return fallbackCategory || DEFAULT_INGREDIENT_CATEGORY;
    }

    const category = data?.category as IngredientCategory;
    
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
      return category;
    }

    console.warn(`Invalid category returned from OpenAI: ${category}, using default`);
    // Try guide as fallback
    const fallbackCategory = getCategoryFromGuide(ingredient);
    return fallbackCategory || DEFAULT_INGREDIENT_CATEGORY;
  } catch (error) {
    console.error('Error categorizing ingredient with OpenAI:', error);
    // Try guide as fallback
    const fallbackCategory = getCategoryFromGuide(ingredient);
    return fallbackCategory || DEFAULT_INGREDIENT_CATEGORY;
  }
}

/**
 * Saves an ingredient category to the database
 */
async function saveIngredientCategory(
  ingredientName: string,
  category: IngredientCategory
): Promise<void> {
  try {
    const normalizedName = ingredientName.toLowerCase().trim();
    
    const { error } = await supabase
      .from('ingredient_categories')
      .upsert({
        ingredient_name: normalizedName,
        category: category,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'ingredient_name'
      });

    if (error) {
      console.error('Error saving ingredient category:', error);
      // Don't throw - this is not critical
    }
  } catch (error) {
    console.error('Error in saveIngredientCategory:', error);
    // Don't throw - this is not critical
  }
}

/**
 * Gets the category for an ingredient, checking database first, then using OpenAI
 */
export async function getCategoryForIngredient(ingredient: string): Promise<IngredientCategory> {
  const normalizedName = normalizeIngredientName(ingredient);
  
  // Skip empty or invalid ingredient names
  if (!normalizedName || normalizedName.length === 0) {
    return DEFAULT_INGREDIENT_CATEGORY;
  }

  // Check database first
  const dbCategory = await getCategoryFromDatabase(normalizedName);
  if (dbCategory) {
    return dbCategory;
  }

  // If not in database, use OpenAI to categorize
  const category = await categorizeWithOpenAI(ingredient);
  
  // Save to database for future use (async, don't wait)
  saveIngredientCategory(normalizedName, category).catch(err => {
    console.error('Failed to save category to database:', err);
  });

  return category;
}

/**
 * Batch categorizes multiple ingredients
 * Returns a map of normalized ingredient names to categories
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

  // Process ingredients in parallel (with some rate limiting consideration)
  const categoryPromises = validIngredients.map(async (ingredient) => {
    const normalizedName = normalizeIngredientName(ingredient);
    if (!normalizedName || normalizedName.length === 0) {
      return null;
    }
    
    const category = await getCategoryForIngredient(ingredient);
    return { normalizedName, category };
  });

  const results = await Promise.allSettled(categoryPromises);
  
  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value) {
      categoryMap.set(result.value.normalizedName, result.value.category);
    }
  });

  return categoryMap;
}
