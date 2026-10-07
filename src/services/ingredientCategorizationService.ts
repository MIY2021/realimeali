import { supabase } from "@/integrations/supabase/client";
import { IngredientCategory, DEFAULT_INGREDIENT_CATEGORY } from "@/types/ingredientCategories";
import { getCategoryFromGuide } from "@/utils/ingredientCategoryGuide";

async function getCategoryFromDatabase(ingredientText: string): Promise<{ category: IngredientCategory } | null> {
  try {
    const { data, error } = await supabase
      .from('ingredient_categories')
      .select('category')
      .eq('ingredient_name', ingredientText.toLowerCase().trim())
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching category from database:', error);
      return null;
    }

    return data ? { category: data.category as IngredientCategory } : null;
  } catch (error) {
    console.error('Error in getCategoryFromDatabase:', error);
    return null;
  }
}

async function categorizeWithOpenAI(ingredient: string): Promise<IngredientCategory> {
  const guideCategory = getCategoryFromGuide(ingredient);
  if (guideCategory) return guideCategory;

  try {
    const { data, error } = await supabase.functions.invoke('categorize-ingredient', {
      body: { ingredient }
    });

    if (error) {
      console.error('Error calling categorize-ingredient function:', error);
      return getCategoryFromGuide(ingredient) || DEFAULT_INGREDIENT_CATEGORY;
    }

    const category = data?.category as IngredientCategory;
    const validCategories: IngredientCategory[] = [
      "Fruit & Vegetables", "Meat & Fish", "Chilled Food", "Bakery",
      "Frozen Food", "Food Cupboard", "Snacks & Treats", "World & Dietary",
      "Drinks", "Alcohol", "Other"
    ];

    return category && validCategories.includes(category)
      ? category
      : (getCategoryFromGuide(ingredient) || DEFAULT_INGREDIENT_CATEGORY);
  } catch (error) {
    console.error('Error categorizing ingredient with OpenAI:', error);
    return getCategoryFromGuide(ingredient) || DEFAULT_INGREDIENT_CATEGORY;
  }
}

async function saveIngredientCategory(ingredientName: string, category: IngredientCategory): Promise<void> {
  try {
    const { error } = await supabase
      .from('ingredient_categories')
      .upsert({
        ingredient_name: ingredientName.toLowerCase().trim(),
        category,
        updated_at: new Date().toISOString()
      }, { onConflict: 'ingredient_name' });

    if (error) throw error;
  } catch (error) {
    console.error('Error in saveIngredientCategory:', error);
    throw error;
  }
}

export async function getCategoryForIngredient(ingredient: string): Promise<IngredientCategory> {
  if (!ingredient || ingredient.trim().length === 0) return DEFAULT_INGREDIENT_CATEGORY;

  const ingredientKey = ingredient.toLowerCase().trim();
  const dbResult = await getCategoryFromDatabase(ingredient);
  if (dbResult) return dbResult.category;

  const category = await categorizeWithOpenAI(ingredient);

  try {
    await saveIngredientCategory(ingredientKey, category);
  } catch (err) {
    console.error(`Failed to save category for "${ingredient}":`, err);
  }

  return category;
}

export async function batchGetCategoriesFromDatabase(
  ingredients: string[]
): Promise<Map<string, IngredientCategory>> {
  const resultMap = new Map<string, IngredientCategory>();
  const normalizedIngredients = [...new Set(ingredients.map(ing => ing.toLowerCase().trim()).filter(Boolean))];
  if (!normalizedIngredients.length) return resultMap;

  try {
    const { data, error } = await supabase
      .from('ingredient_categories')
      .select('ingredient_name, category')
      .in('ingredient_name', normalizedIngredients);

    if (error) {
      console.error('Error batch fetching categories:', error);
      return resultMap;
    }

    for (const item of data || []) {
      resultMap.set(item.ingredient_name, item.category as IngredientCategory);
    }
  } catch (error) {
    console.error('Error in batchGetCategoriesFromDatabase:', error);
  }

  return resultMap;
}


export interface ShoppingIngredientNormalization {
  id: number;
  category: IngredientCategory;
  shoppingName: string;
}

export async function normalizeShoppingIngredients(
  ingredients: string[]
): Promise<Map<string, ShoppingIngredientNormalization>> {
  const resultMap = new Map<string, ShoppingIngredientNormalization>();

  const uniqueIngredients = [...new Set(
    ingredients.map(value => value.trim()).filter(Boolean)
  )];

  if (!uniqueIngredients.length) return resultMap;

  try {
    const { data, error } = await supabase.functions.invoke(
      'normalize-shopping-ingredients',
      {
        body: {
          ingredients: uniqueIngredients.map((text, id) => ({ id, text }))
        }
      }
    );

    if (error) {
      console.error('Error normalising shopping ingredients:', error);
      return resultMap;
    }

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

    for (const item of data?.items || []) {
      const id = Number(item?.id);
      const source = uniqueIngredients[id];
      const shoppingName = typeof item?.shoppingName === 'string'
        ? item.shoppingName.trim()
        : '';

      if (!source || !shoppingName) continue;

      resultMap.set(source.toLowerCase(), {
        id,
        category: validCategories.includes(item.category)
          ? item.category
          : DEFAULT_INGREDIENT_CATEGORY,
        shoppingName
      });
    }
  } catch (error) {
    console.error('Error normalising shopping ingredients:', error);
  }

  return resultMap;
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
