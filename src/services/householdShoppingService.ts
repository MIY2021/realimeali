
import { supabase } from "@/integrations/supabase/client";
import { HouseholdShoppingItem, HouseholdRecipeCategory } from "@/types/householdShopping";
import { DEFAULT_RECIPE_CATEGORIES } from "@/constants/householdShopping";

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
}
