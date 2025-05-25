
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useToast } from "@/hooks/use-toast";

interface ShoppingListItem {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category: string;
  isChecked: boolean;
  isCustom: boolean;
  recipeIds: string[];
}

interface ShoppingListCategory {
  [key: string]: ShoppingListItem[];
}

const SHOPPING_CATEGORIES = [
  "Produce",
  "Meat & Seafood", 
  "Dairy & Eggs",
  "Pantry & Dry Goods",
  "Frozen",
  "Bakery",
  "Beverages",
  "Other"
];

export const useShoppingList = (weekNumber: 1 | 2) => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { getMealPlansForWeek } = useMealPlan();
  const { recipes } = useRecipes();
  const { toast } = useToast();
  
  const [shoppingList, setShoppingList] = useState<ShoppingListCategory>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const categorizeIngredient = useCallback((ingredient: string): string => {
    const lower = ingredient.toLowerCase();
    
    if (lower.includes('chicken') || lower.includes('beef') || lower.includes('pork') || 
        lower.includes('fish') || lower.includes('salmon') || lower.includes('tuna') ||
        lower.includes('shrimp') || lower.includes('meat')) {
      return "Meat & Seafood";
    }
    if (lower.includes('milk') || lower.includes('cheese') || lower.includes('yogurt') || 
        lower.includes('butter') || lower.includes('egg') || lower.includes('cream')) {
      return "Dairy & Eggs";
    }
    if (lower.includes('onion') || lower.includes('garlic') || lower.includes('tomato') ||
        lower.includes('potato') || lower.includes('carrot') || lower.includes('pepper') ||
        lower.includes('lettuce') || lower.includes('spinach') || lower.includes('apple') ||
        lower.includes('banana') || lower.includes('lemon') || lower.includes('herbs') ||
        lower.includes('mushroom') || lower.includes('broccoli') || lower.includes('cucumber')) {
      return "Produce";
    }
    if (lower.includes('rice') || lower.includes('pasta') || lower.includes('flour') || 
        lower.includes('oil') || lower.includes('salt') || lower.includes('pepper') ||
        lower.includes('sauce') || lower.includes('vinegar') || lower.includes('spice') ||
        lower.includes('bean') || lower.includes('lentil') || lower.includes('quinoa')) {
      return "Pantry & Dry Goods";
    }
    if (lower.includes('frozen') || lower.includes('ice cream')) {
      return "Frozen";
    }
    if (lower.includes('bread') || lower.includes('bagel') || lower.includes('muffin')) {
      return "Bakery";
    }
    if (lower.includes('juice') || lower.includes('soda') || lower.includes('water') ||
        lower.includes('coffee') || lower.includes('tea') || lower.includes('wine') ||
        lower.includes('beer')) {
      return "Beverages";
    }
    
    return "Other";
  }, []);

  const loadExistingShoppingList = useCallback(async () => {
    if (!user || !currentHousehold) return;

    try {
      const { data, error } = await supabase
        .from('household_shopping_lists')
        .select('*')
        .eq('household_id', currentHousehold.id);

      if (error) throw error;

      const categorizedItems: ShoppingListCategory = {};
      SHOPPING_CATEGORIES.forEach(cat => {
        categorizedItems[cat] = [];
      });

      (data || []).forEach((item: any) => {
        const category = item.category || "Other";
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
  }, [user, currentHousehold]);

  const generateShoppingListFromMealPlans = useCallback(async () => {
    if (!user || !currentHousehold || !recipes.length) return {};

    const mealPlans = getMealPlansForWeek(weekNumber);
    if (!mealPlans.length) return {};

    const ingredientMap = new Map<string, {
      quantity: number;
      unit: string;
      category: string;
      recipeIds: string[];
    }>();

    mealPlans.forEach(mealPlan => {
      if (mealPlan.isLeftover) return;
      
      const recipe = recipes.find(r => r.id === mealPlan.recipeId);
      if (!recipe) return;

      recipe.ingredients.forEach(ingredient => {
        const normalizedName = ingredient.toLowerCase().trim();
        const category = categorizeIngredient(ingredient);
        
        if (ingredientMap.has(normalizedName)) {
          const existing = ingredientMap.get(normalizedName)!;
          existing.recipeIds.push(recipe.id);
        } else {
          ingredientMap.set(normalizedName, {
            quantity: 1,
            unit: '',
            category,
            recipeIds: [recipe.id]
          });
        }
      });
    });

    const categorizedItems: ShoppingListCategory = {};
    SHOPPING_CATEGORIES.forEach(cat => {
      categorizedItems[cat] = [];
    });

    for (const [name, details] of ingredientMap) {
      categorizedItems[details.category].push({
        id: `generated-${name}`,
        name,
        quantity: details.quantity,
        unit: details.unit,
        category: details.category,
        isChecked: false,
        isCustom: false,
        recipeIds: details.recipeIds
      });
    }

    return categorizedItems;
  }, [user, currentHousehold, recipes, getMealPlansForWeek, weekNumber, categorizeIngredient]);

  const initializeShoppingList = useCallback(async () => {
    if (!user || !currentHousehold || hasInitialized) return;

    setIsLoading(true);
    try {
      // Load existing items first
      const existingItems = await loadExistingShoppingList();
      
      // Check if we have any existing items
      const hasExistingItems = Object.values(existingItems || {}).some(items => items.length > 0);
      
      if (hasExistingItems) {
        // If we have existing items, use them
        setShoppingList(existingItems || {});
      } else {
        // If no existing items, generate from meal plans
        const generatedItems = await generateShoppingListFromMealPlans();
        setShoppingList(generatedItems);
      }
      
      setHasInitialized(true);
    } catch (error) {
      console.error("Error initializing shopping list:", error);
      toast({
        title: "Error",
        description: "Failed to load shopping list",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, currentHousehold, hasInitialized, loadExistingShoppingList, generateShoppingListFromMealPlans, toast]);

  const generateFromMealPlans = useCallback(async () => {
    if (!user || !currentHousehold) return;

    setIsLoading(true);
    try {
      const generatedItems = await generateShoppingListFromMealPlans();
      setShoppingList(generatedItems);
      
      toast({
        title: "Shopping list generated",
        description: `Generated from week ${weekNumber} meal plans`,
      });
    } catch (error) {
      console.error("Error generating shopping list:", error);
      toast({
        title: "Error",
        description: "Failed to generate shopping list",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, currentHousehold, generateShoppingListFromMealPlans, weekNumber, toast]);

  const toggleItemChecked = useCallback(async (itemId: string, category: string) => {
    if (!user || !currentHousehold) return;

    const items = shoppingList[category] || [];
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const newCheckedState = !item.isChecked;

    // Update local state immediately
    setShoppingList(prev => ({
      ...prev,
      [category]: prev[category]?.map(i => 
        i.id === itemId ? { ...i, isChecked: newCheckedState } : i
      ) || []
    }));

    // Update database if it's a saved item
    if (!item.id.startsWith('generated-')) {
      try {
        const { error } = await supabase
          .from('household_shopping_lists')
          .update({ is_checked: newCheckedState })
          .eq('id', itemId)
          .eq('household_id', currentHousehold.id);

        if (error) throw error;
      } catch (error) {
        console.error("Error updating item:", error);
        // Revert on error
        setShoppingList(prev => ({
          ...prev,
          [category]: prev[category]?.map(i => 
            i.id === itemId ? { ...i, isChecked: !newCheckedState } : i
          ) || []
        }));
      }
    }
  }, [user, currentHousehold, shoppingList]);

  const addCustomItem = useCallback(async (name: string, category: string) => {
    if (!user || !currentHousehold || !name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('household_shopping_lists')
        .insert({
          household_id: currentHousehold.id,
          created_by: user.id,
          name: name.trim(),
          category,
          is_custom: true,
          is_checked: false
        })
        .select()
        .single();

      if (error) throw error;

      const newItem: ShoppingListItem = {
        id: data.id,
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        category: data.category,
        isChecked: data.is_checked,
        isCustom: data.is_custom,
        recipeIds: data.recipe_ids || []
      };

      setShoppingList(prev => ({
        ...prev,
        [category]: [...(prev[category] || []), newItem]
      }));

      toast({
        title: "Item added",
        description: `${name} added to ${category}`,
      });
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    }
  }, [user, currentHousehold, toast]);

  const removeItem = useCallback(async (itemId: string, category: string) => {
    if (!user || !currentHousehold) return;

    // Update local state immediately
    setShoppingList(prev => ({
      ...prev,
      [category]: prev[category]?.filter(i => i.id !== itemId) || []
    }));

    // Remove from database if it's a saved item
    if (!itemId.startsWith('generated-')) {
      try {
        const { error } = await supabase
          .from('household_shopping_lists')
          .delete()
          .eq('id', itemId)
          .eq('household_id', currentHousehold.id);

        if (error) throw error;
      } catch (error) {
        console.error("Error removing item:", error);
        toast({
          title: "Error",
          description: "Failed to remove item",
          variant: "destructive",
        });
      }
    }
  }, [user, currentHousehold, toast]);

  const clearAll = useCallback(async () => {
    if (!user || !currentHousehold) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('household_shopping_lists')
        .delete()
        .eq('household_id', currentHousehold.id);

      if (error) throw error;

      // Reset to empty categories
      const emptyCategories: ShoppingListCategory = {};
      SHOPPING_CATEGORIES.forEach(cat => {
        emptyCategories[cat] = [];
      });
      
      setShoppingList(emptyCategories);
      setHasInitialized(false);

      toast({
        title: "Shopping list cleared",
        description: "All items have been removed",
      });
    } catch (error) {
      console.error("Error clearing shopping list:", error);
      toast({
        title: "Error",
        description: "Failed to clear shopping list",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, currentHousehold, toast]);

  // Initialize shopping list once when component mounts
  useEffect(() => {
    initializeShoppingList();
  }, [initializeShoppingList]);

  return {
    shoppingList,
    isLoading,
    generateFromMealPlans,
    toggleItemChecked,
    addCustomItem,
    removeItem,
    clearAll,
  };
};
