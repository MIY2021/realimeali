
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";

export interface HouseholdShoppingItem {
  id: string;
  household_id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category: string;
  is_checked: boolean;
  is_custom: boolean;
  recipe_ids: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface HouseholdRecipeCategory {
  id: string;
  household_id: string;
  name: string;
  created_by: string;
  created_at: string;
}

interface HouseholdShoppingContextType {
  shoppingItems: HouseholdShoppingItem[];
  recipeCategories: HouseholdRecipeCategory[];
  isLoading: boolean;
  fetchShoppingItems: () => Promise<void>;
  fetchRecipeCategories: () => Promise<void>;
  addShoppingItem: (item: Omit<HouseholdShoppingItem, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'household_id'>) => Promise<void>;
  updateShoppingItem: (id: string, updates: Partial<HouseholdShoppingItem>) => Promise<void>;
  deleteShoppingItem: (id: string) => Promise<void>;
  addRecipeCategory: (name: string) => Promise<void>;
  updateRecipeCategory: (id: string, name: string) => Promise<void>;
  deleteRecipeCategory: (id: string) => Promise<void>;
  generateShoppingListFromMealPlan: () => Promise<void>;
}

const HouseholdShoppingContext = createContext<HouseholdShoppingContextType | undefined>(undefined);

export const HouseholdShoppingProvider = ({ children }: { children: ReactNode }) => {
  const [shoppingItems, setShoppingItems] = useState<HouseholdShoppingItem[]>([]);
  const [recipeCategories, setRecipeCategories] = useState<HouseholdRecipeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();

  const fetchShoppingItems = async () => {
    if (!currentHousehold || !user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('household_shopping_lists')
        .select('*')
        .eq('household_id', currentHousehold.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShoppingItems(data || []);
    } catch (error) {
      console.error('Error fetching shopping items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shopping items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecipeCategories = async () => {
    if (!currentHousehold || !user) return;

    try {
      const { data, error } = await supabase
        .from('household_recipe_categories')
        .select('*')
        .eq('household_id', currentHousehold.id)
        .order('name');

      if (error) throw error;
      setRecipeCategories(data || []);
    } catch (error) {
      console.error('Error fetching recipe categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch recipe categories",
        variant: "destructive",
      });
    }
  };

  const addShoppingItem = async (item: Omit<HouseholdShoppingItem, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'household_id'>) => {
    if (!currentHousehold || !user) return;

    try {
      const { data, error } = await supabase
        .from('household_shopping_lists')
        .insert([{
          ...item,
          household_id: currentHousehold.id,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      setShoppingItems(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding shopping item:', error);
      toast({
        title: "Error",
        description: "Failed to add shopping item",
        variant: "destructive",
      });
    }
  };

  const updateShoppingItem = async (id: string, updates: Partial<HouseholdShoppingItem>) => {
    try {
      const { data, error } = await supabase
        .from('household_shopping_lists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setShoppingItems(prev => prev.map(item => item.id === id ? data : item));
    } catch (error) {
      console.error('Error updating shopping item:', error);
      toast({
        title: "Error",
        description: "Failed to update shopping item",
        variant: "destructive",
      });
    }
  };

  const deleteShoppingItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('household_shopping_lists')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setShoppingItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting shopping item:', error);
      toast({
        title: "Error",
        description: "Failed to delete shopping item",
        variant: "destructive",
      });
    }
  };

  const addRecipeCategory = async (name: string) => {
    if (!currentHousehold || !user) return;

    try {
      const { data, error } = await supabase
        .from('household_recipe_categories')
        .insert([{
          household_id: currentHousehold.id,
          name: name,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      setRecipeCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast({
        title: "Category Added",
        description: `${name} category has been added`,
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const updateRecipeCategory = async (id: string, name: string) => {
    try {
      const { data, error } = await supabase
        .from('household_recipe_categories')
        .update({ name })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setRecipeCategories(prev => prev.map(cat => cat.id === id ? data : cat).sort((a, b) => a.name.localeCompare(b.name)));
      toast({
        title: "Category Updated",
        description: `Category has been updated to ${name}`,
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const deleteRecipeCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('household_recipe_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRecipeCategories(prev => prev.filter(cat => cat.id !== id));
      toast({
        title: "Category Deleted",
        description: "Category has been deleted",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const generateShoppingListFromMealPlan = async () => {
    if (!currentHousehold || !user) return;

    try {
      // Get current household meal plans
      const { data: mealPlans, error: mealError } = await supabase
        .from('household_meal_plans')
        .select(`
          *,
          recipes(*)
        `)
        .eq('household_id', currentHousehold.id);

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

      // Add to shopping list
      const itemsToAdd = Array.from(ingredientMap.entries()).map(([key, data]) => {
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

      for (const item of itemsToAdd) {
        await addShoppingItem(item);
      }

      toast({
        title: "Shopping List Generated",
        description: `Added ${itemsToAdd.length} items from your meal plan`,
      });
    } catch (error) {
      console.error('Error generating shopping list:', error);
      toast({
        title: "Error",
        description: "Failed to generate shopping list from meal plan",
        variant: "destructive",
      });
    }
  };

  // Helper functions
  const parseIngredientQty = (text: string): { qty: number; unit: string; name: string } => {
    const match = text.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)?\s+(.*)$/);
    if (match) {
      return {
        qty: parseFloat(match[1]),
        unit: match[2] ? match[2].trim() : "",
        name: match[3].toLowerCase(),
      };
    }
    return { qty: 1, unit: "", name: text.toLowerCase() };
  };

  const categoriseByName = (name: string): string => {
    const nameLower = name.toLowerCase();
    if (/lettuce|onion|potato|tomato|carrot|spinach|garlic|pepper|broccoli|cucumber|lemon|lime|herbs|vegetable/i.test(nameLower)) {
      return "Produce";
    } else if (/chicken|beef|pork|fish|salmon|shrimp|turkey|meat/i.test(nameLower)) {
      return "Meat & Seafood";
    } else if (/milk|cheese|yogurt|cream|butter|egg/i.test(nameLower)) {
      return "Dairy & Eggs";
    } else if (/flour|sugar|oil|vinegar|rice|pasta|sauce|spice|salt|pepper|canned|dried/i.test(nameLower)) {
      return "Pantry";
    } else if (/bread|bun|bagel|muffin|roll|cake|pastry/i.test(nameLower)) {
      return "Bakery";
    } else if (/frozen|ice/i.test(nameLower)) {
      return "Frozen";
    } else {
      return "Other";
    }
  };

  useEffect(() => {
    if (currentHousehold) {
      fetchShoppingItems();
      fetchRecipeCategories();
    }
  }, [currentHousehold]);

  return (
    <HouseholdShoppingContext.Provider value={{
      shoppingItems,
      recipeCategories,
      isLoading,
      fetchShoppingItems,
      fetchRecipeCategories,
      addShoppingItem,
      updateShoppingItem,
      deleteShoppingItem,
      addRecipeCategory,
      updateRecipeCategory,
      deleteRecipeCategory,
      generateShoppingListFromMealPlan
    }}>
      {children}
    </HouseholdShoppingContext.Provider>
  );
};

export const useHouseholdShopping = () => {
  const context = useContext(HouseholdShoppingContext);
  if (context === undefined) {
    throw new Error("useHouseholdShopping must be used within a HouseholdShoppingProvider");
  }
  return context;
};
