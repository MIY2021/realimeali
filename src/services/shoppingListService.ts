import { supabase } from "@/integrations/supabase/client";
import { ShoppingListItem, ShoppingListCategory, SHOPPING_CATEGORIES } from "@/types/shoppingList";

export class ShoppingListService {
  static async loadExistingShoppingList(householdId: string): Promise<ShoppingListCategory> {
    try {
      const { data, error } = await supabase
        .from('household_shopping_lists')
        .select('*')
        .eq('household_id', householdId);

      if (error) throw error;

      const categorizedItems: ShoppingListCategory = {};
      SHOPPING_CATEGORIES.forEach(cat => {
        categorizedItems[cat] = [];
      });

      (data || []).forEach((item: any) => {
        const category = item.category || "Food Cupboard";
        if (!categorizedItems[category]) {
          categorizedItems[category] = [];
        }
        
        categorizedItems[category].push({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: category,
          isChecked: item.is_checked,
          isCustom: item.is_custom,
          recipeIds: item.recipe_ids || []
        });
      });

      return categorizedItems;
    } catch (error) {
      console.error("Error loading shopping list:", error);
      return {};
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
    category: string, 
    householdId: string, 
    userId: string, 
    recipeIds: string[] = []
  ): Promise<ShoppingListItem | null> {
    try {
      const { data, error } = await supabase
        .from('household_shopping_lists')
        .insert({
          household_id: householdId,
          created_by: userId,
          name: name.trim(),
          category,
          is_custom: recipeIds.length === 0,
          is_checked: false,
          recipe_ids: recipeIds
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        category: data.category,
        isChecked: data.is_checked,
        isCustom: data.is_custom,
        recipeIds: data.recipe_ids || []
      };
    } catch (error) {
      console.error("Error adding item:", error);
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

  static async clearAll(householdId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('household_shopping_lists')
        .delete()
        .eq('household_id', householdId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error clearing shopping list:", error);
      return false;
    }
  }
}
