
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useToast } from "@/hooks/use-toast";
import { ShoppingListCategory, SHOPPING_CATEGORIES } from "@/types/shoppingList";
import { ShoppingListService } from "@/services/shoppingListService";
import { useShoppingListGenerator } from "@/hooks/useShoppingListGenerator";
import { supabase } from "@/integrations/supabase/client";

export const useShoppingList = (weekNumber: 1 | 2) => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { getMealPlansForWeek } = useMealPlan();
  const { toast } = useToast();
  const { generateAndSaveFromMealPlans } = useShoppingListGenerator();
  
  const [shoppingList, setShoppingList] = useState<ShoppingListCategory>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load existing shopping list
  const loadShoppingList = useCallback(async () => {
    if (!user || !currentHousehold) return;

    setIsLoading(true);
    try {
      const existingItems = await ShoppingListService.loadExistingShoppingList(currentHousehold.id);
      setShoppingList(existingItems || {});
    } catch (error) {
      console.error("Error loading shopping list:", error);
      toast({
        title: "Error",
        description: "Failed to load shopping list",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, currentHousehold, toast]);

  // Auto-generate shopping list from meal plans if empty
  const autoGenerateFromMealPlans = useCallback(async () => {
    if (!user || !currentHousehold) return;

    const mealPlans = getMealPlansForWeek(weekNumber);
    
    // Only generate if we have meal plans and no existing items
    if (mealPlans.length > 0) {
      const allItems = Object.values(shoppingList).flat();
      if (allItems.length === 0) {
        setIsLoading(true);
        try {
          console.log('Auto-generating shopping list from meal plans');
          await generateAndSaveFromMealPlans(weekNumber);
          await loadShoppingList(); // Reload after generation
        } catch (error) {
          console.error("Error auto-generating shopping list:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }
  }, [user, currentHousehold, getMealPlansForWeek, weekNumber, generateAndSaveFromMealPlans, shoppingList, loadShoppingList]);

  // Set up real-time subscription for cross-household sync
  useEffect(() => {
    if (!currentHousehold) return;

    const channel = supabase
      .channel('shopping-list-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'household_shopping_lists',
          filter: `household_id=eq.${currentHousehold.id}`
        },
        (payload) => {
          console.log('Shopping list changed:', payload);
          loadShoppingList(); // Reload when any changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentHousehold, loadShoppingList]);

  // Load shopping list when dependencies change
  useEffect(() => {
    loadShoppingList();
  }, [loadShoppingList]);

  // Auto-generate when shopping list is loaded
  useEffect(() => {
    autoGenerateFromMealPlans();
  }, [autoGenerateFromMealPlans]);

  const toggleItemChecked = useCallback(async (itemId: string, category: string) => {
    if (!user || !currentHousehold) return;

    console.log('Toggling item checked:', itemId, category);

    const items = shoppingList[category] || [];
    const item = items.find(i => i.id === itemId);
    if (!item) {
      console.error('Item not found:', itemId, category);
      return;
    }

    const newCheckedState = !item.isChecked;
    console.log('New checked state:', newCheckedState);

    // Update local state immediately for responsiveness
    setShoppingList(prev => ({
      ...prev,
      [category]: prev[category]?.map(i => 
        i.id === itemId ? { ...i, isChecked: newCheckedState } : i
      ) || []
    }));

    // Update database
    const success = await ShoppingListService.toggleItemChecked(itemId, newCheckedState, currentHousehold.id);
    
    if (!success) {
      console.error('Failed to update item in database');
      // Revert on error
      setShoppingList(prev => ({
        ...prev,
        [category]: prev[category]?.map(i => 
          i.id === itemId ? { ...i, isChecked: !newCheckedState } : i
        ) || []
      }));
      
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  }, [user, currentHousehold, shoppingList, toast]);

  const addCustomItem = useCallback(async (name: string, category: string) => {
    if (!user || !currentHousehold || !name.trim()) return;

    const newItem = await ShoppingListService.addCustomItem(name, category, currentHousehold.id, user.id);
    
    if (newItem) {
      // Real-time sync will handle the update, but add locally for immediate feedback
      setShoppingList(prev => ({
        ...prev,
        [category]: [...(prev[category] || []), newItem]
      }));

      toast({
        title: "Item added",
        description: `${name} added to ${category}`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    }
  }, [user, currentHousehold, toast]);

  const clearAll = useCallback(async () => {
    if (!user || !currentHousehold) return;

    setIsLoading(true);
    try {
      const success = await ShoppingListService.clearAll(currentHousehold.id);
      
      if (success) {
        const emptyCategories: ShoppingListCategory = {};
        SHOPPING_CATEGORIES.forEach(cat => {
          emptyCategories[cat] = [];
        });
        
        setShoppingList(emptyCategories);

        toast({
          title: "Shopping list cleared",
          description: "All items have been removed",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to clear shopping list",
          variant: "destructive",
        });
      }
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

  return {
    shoppingList,
    isLoading,
    toggleItemChecked,
    addCustomItem,
    clearAll,
  };
};
