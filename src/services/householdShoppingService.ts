
import { supabase } from "@/integrations/supabase/client";
import { HouseholdShoppingItem, HouseholdRecipeCategory } from "@/types/householdShopping";
import { DEFAULT_RECIPE_CATEGORIES } from "@/constants/householdShopping";
import { parseIngredientQty, categoriseByName } from "@/utils/householdShoppingUtils";

export class HouseholdShoppingService {
  static async fetchShoppingItems(householdId: string): Promise<HouseholdShoppingItem[]> {
    const { data, error } = await supabase
      .from('household_shopping_lists')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async fetchRecipeCategories(householdId: string): Promise<HouseholdRecipeCategory[]> {
    const { data, error } = await supabase
      .from('household_recipe_categories')
      .select('*')
      .eq('household_id', householdId)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async addShoppingItem(
    item: Omit<HouseholdShoppingItem, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'household_id'>,
    householdId: string,
    userId: string
  ): Promise<HouseholdShoppingItem> {
    const { data, error } = await supabase
      .from('household_shopping_lists')
      .insert([{
        ...item,
        household_id: householdId,
        created_by: userId
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateShoppingItem(id: string, updates: Partial<HouseholdShoppingItem>): Promise<HouseholdShoppingItem> {
    const { data, error } = await supabase
      .from('household_shopping_lists')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteShoppingItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('household_shopping_lists')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async addRecipeCategory(name: string, householdId: string, userId: string): Promise<HouseholdRecipeCategory> {
    const { data, error } = await supabase
      .from('household_recipe_categories')
      .insert([{
        household_id: householdId,
        name: name,
        created_by: userId
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateRecipeCategory(id: string, name: string): Promise<HouseholdRecipeCategory> {
    const { data, error } = await supabase
      .from('household_recipe_categories')
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteRecipeCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('household_recipe_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async seedDefaultCategories(householdId: string, userId: string): Promise<boolean> {
    // Check if household already has categories
    const { data: existingCategories, error: checkError } = await supabase
      .from('household_recipe_categories')
      .select('id')
      .eq('household_id', householdId);

    if (checkError) throw checkError;

    // Only seed if no categories exist
    if (existingCategories && existingCategories.length === 0) {
      const categoriesToInsert = DEFAULT_RECIPE_CATEGORIES.map(name => ({
        household_id: householdId,
        name,
        created_by: userId
      }));

      const { error } = await supabase
        .from('household_recipe_categories')
        .insert(categoriesToInsert);

      if (error) throw error;
      return true;
    }
    return false;
  }

  static async generateShoppingListFromMealPlan(householdId: string, userId: string): Promise<Array<Omit<HouseholdShoppingItem, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'household_id'>>> {
    // Get current household meal plans
    const { data: mealPlans, error: mealError } = await supabase
      .from('household_meal_plans')
      .select(`
        *,
        recipes(*)
      `)
      .eq('household_id', householdId);

    if (mealError) throw mealError;

    // Extract ingredients from recipes
    const ingredientMap = new Map<string, { quantity: number; unit: string; recipe_ids: string[] }>();
    
    mealPlans?.forEach(plan => {
      if (plan.recipes?.ingredients) {
        plan.recipes.ingredients.forEach((ingredient: string) => {
          const { qty, unit, name } = parseIngredientQty(ingredient);
          const key = `${name}_${unit}`;
          
          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!;
            existing.quantity += qty;
            if (!existing.recipe_ids.includes(plan.recipe_id)) {
              existing.recipe_ids.push(plan.recipe_id);
            }
          } else {
            ingredientMap.set(key, {
              quantity: qty,
              unit,
              recipe_ids: [plan.recipe_id]
            });
          }
        });
      }
    });

    // Convert to shopping list items
    return Array.from(ingredientMap.entries()).map(([key, data]) => {
      const name = key.replace(`_${data.unit}`, '');
      return {
        name,
        quantity: data.quantity,
        unit: data.unit,
        category: categoriseByName(name),
        is_checked: false,
        is_custom: false,
        recipe_ids: data.recipe_ids
      };
    });
  }
}
