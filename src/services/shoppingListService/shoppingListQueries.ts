
import { supabase } from "@/integrations/supabase/client";
import { ShoppingListItem } from "@/types/shoppingList";

export class ShoppingListQueries {
  static async loadExistingShoppingList(householdId: string, weekNumber: number): Promise<ShoppingListItem[]> {
    try {
      console.log('Loading shopping list:', { householdId, weekNumber });
      
      const { data, error } = await supabase
        .from('household_shopping_lists')
        .select('*')
        .eq('household_id', householdId)
        .eq('week_number', weekNumber)
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
        unit: item.unit,
        consolidatedQuantity: item.consolidated_quantity,
        consolidatedUnit: item.consolidated_unit,
        sourceIngredients: item.source_ingredients || [],
        isChecked: item.is_checked,
        isCustom: item.is_custom,
        recipeIds: item.recipe_ids || [],
        createdAt: item.created_at
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

  static async clearAll(householdId: string, weekNumber: number): Promise<boolean> {
    try {
      console.log('Clearing all items for:', { householdId, weekNumber });
      
      const { error } = await supabase
        .from('household_shopping_lists')
        .delete()
        .eq('household_id', householdId)
        .eq('week_number', weekNumber);

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
}
