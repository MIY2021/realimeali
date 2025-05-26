
import { supabase } from "@/integrations/supabase/client";
import { ShoppingListItem } from "@/types/shoppingList";

export class ShoppingListService {
  static async loadExistingShoppingList(householdId: string, weekNumber: number): Promise<ShoppingListItem[]> {
    try {
      const { data, error } = await supabase
        .from('household_shopping_lists')
        .select('*')
        .eq('household_id', householdId)
        .eq('week_number', weekNumber);

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        consolidatedQuantity: item.consolidated_quantity,
        consolidatedUnit: item.consolidated_unit,
        sourceIngredients: item.source_ingredients || [],
        isChecked: item.is_checked,
        isCustom: item.is_custom,
        recipeIds: item.recipe_ids || []
      }));
    } catch (error) {
      console.error("Error loading shopping list:", error);
      return [];
    }
  }

  static async checkDatabaseForItems(householdId: string, weekNumber: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('household_shopping_lists')
        .select('id')
        .eq('household_id', householdId)
        .eq('week_number', weekNumber)
        .limit(1);

      if (error) throw error;
      return (data || []).length > 0;
    } catch (error) {
      console.error("Error checking database for items:", error);
      return false;
    }
  }

  static async toggleItemChecked(itemId: string, newCheckedState: boolean, householdId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('household_shopping_lists')
        .update({ is_checked: newCheckedState })
        .eq('id', itemId)
        .eq('household_id', householdId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating item:", error);
      return false;
    }
  }

  static async addCustomItem(
    name: string, 
    householdId: string, 
    userId: string, 
    weekNumber: number,
    recipeIds: string[] = []
  ): Promise<ShoppingListItem | null> {
    try {
      const { data, error } = await supabase
        .from('household_shopping_lists')
        .insert({
          household_id: householdId,
          created_by: userId,
          name: name.trim(),
          week_number: weekNumber,
          is_custom: recipeIds.length === 0,
          is_checked: false,
          recipe_ids: recipeIds,
          consolidated_quantity: 1,
          consolidated_unit: '',
          source_ingredients: [name.trim()]
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        consolidatedQuantity: data.consolidated_quantity,
        consolidatedUnit: data.consolidated_unit,
        sourceIngredients: data.source_ingredients || [],
        isChecked: data.is_checked,
        isCustom: data.is_custom,
        recipeIds: data.recipe_ids || []
      };
    } catch (error) {
      console.error("Error adding item:", error);
      return null;
    }
  }

  static async addConsolidatedItem(
    name: string,
    consolidatedQuantity: number,
    consolidatedUnit: string,
    sourceIngredients: string[],
    recipeIds: string[],
    householdId: string,
    userId: string,
    weekNumber: number
  ): Promise<ShoppingListItem | null> {
    try {
      const { data, error } = await supabase
        .from('household_shopping_lists')
        .insert({
          household_id: householdId,
          created_by: userId,
          name: name.trim(),
          week_number: weekNumber,
          is_custom: false,
          is_checked: false,
          recipe_ids: recipeIds,
          consolidated_quantity: consolidatedQuantity,
          consolidated_unit: consolidatedUnit,
          source_ingredients: sourceIngredients
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        consolidatedQuantity: data.consolidated_quantity,
        consolidatedUnit: data.consolidated_unit,
        sourceIngredients: data.source_ingredients || [],
        isChecked: data.is_checked,
        isCustom: data.is_custom,
        recipeIds: data.recipe_ids || []
      };
    } catch (error) {
      console.error("Error adding consolidated item:", error);
      return null;
    }
  }

  static async removeItem(itemId: string, householdId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('household_shopping_lists')
        .delete()
        .eq('id', itemId)
        .eq('household_id', householdId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error removing item:", error);
      return false;
    }
  }

  static async clearAll(householdId: string, weekNumber: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('household_shopping_lists')
        .delete()
        .eq('household_id', householdId)
        .eq('week_number', weekNumber);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error clearing shopping list:", error);
      return false;
    }
  }
}
