import { supabase } from "@/integrations/supabase/client";
import { ShoppingListItem } from "@/types/shoppingList";

export class ShoppingListQueries {
  static async loadExistingShoppingList(householdId: string, weekKey: string): Promise<ShoppingListItem[]> {
    try {
      console.log('Loading shopping list:', { householdId, weekKey });
      
      const { data, error } = await supabase
        .from('household_shopping_lists')
        .select('id, name, quantity, quantity_display, unit, consolidated_quantity, consolidated_unit, source_ingredients, is_checked, is_custom, recipe_ids, created_at, created_by, category')
        .eq('household_id', householdId)
        .eq('week_key', weekKey)
        .order('is_custom', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error loading shopping list:', error);
        throw error;
      }

      console.log('Loaded shopping list items:', data?.length || 0);

      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        quantityDisplay: item.quantity_display,
        unit: item.unit,
        consolidatedQuantity: item.consolidated_quantity,
        consolidatedUnit: item.consolidated_unit,
        sourceIngredients: item.source_ingredients || [],
        isChecked: item.is_checked,
        isCustom: item.is_custom,
        recipeIds: item.recipe_ids || [],
        createdAt: item.created_at,
        createdBy: item.created_by,
        category: item.category
      }));
    } catch (error) {
      // Keep read failures distinct from a genuinely empty list. Automatic
      // generation must not mistake a failed SELECT for "no existing items"
      // and replace checked rows/custom items on the next page load.
      console.error("Error loading shopping list:", error);
      throw error;
    }
  }

  static async checkDatabaseForItems(householdId: string, weekKey: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('household_shopping_lists')
        .select('id')
        .eq('household_id', householdId)
        .eq('week_key', weekKey)
        .limit(1);

      if (error) throw error;
      return (data || []).length > 0;
    } catch (error) {
      console.error("Error checking database for items:", error);
      return false;
    }
  }

  static async clearAll(householdId: string, weekKey: string): Promise<boolean> {
    try {
      console.log('Clearing all items for:', { householdId, weekKey });
      
      const { error } = await supabase
        .from('household_shopping_lists')
        .delete()
        .eq('household_id', householdId)
        .eq('week_key', weekKey);

      if (error) {
        console.error('Database error clearing shopping list:', error);
        throw error;
      }

      console.log('Successfully cleared shopping list');
      return true;
    } catch (error) {
      console.error("Error clearing shopping list:", error);
      return false;
    }
  }

  static async getAllWeekKeysWithShoppingLists(householdId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('household_shopping_lists')
        .select('week_key')
        .eq('household_id', householdId)
        .not('week_key', 'is', null);

      if (error) {
        console.error('Database error getting week keys:', error);
        throw error;
      }

      // Get unique week keys
      const weekKeys = new Set<string>();
      (data || []).forEach((item: any) => {
        if (item.week_key) {
          weekKeys.add(item.week_key);
        }
      });

      return Array.from(weekKeys);
    } catch (error) {
      console.error("Error getting week keys with shopping lists:", error);
      return [];
    }
  }
}
