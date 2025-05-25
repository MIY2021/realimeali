
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useToast } from "@/hooks/use-toast";
import { ShoppingListCategory, SHOPPING_CATEGORIES } from "@/types/shoppingList";
import { ShoppingListService } from "@/services/shoppingListService";
import { useShoppingListGenerator } from "@/hooks/useShoppingListGenerator";

export const useShoppingList = (weekNumber: 1 | 2) => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { toast } = useToast();
  const { generateFromMealPlans: generateItems } = useShoppingListGenerator();
  
  const [shoppingList, setShoppingList] = useState<ShoppingListCategory>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const initializeShoppingList = useCallback(async () => {
    if (!user || !currentHousehold || hasInitialized) return;

    setIsLoading(true);
    try {
      // Always try to generate from meal plans for auto-generation
      const generatedItems = generateItems(weekNumber);
      
      // Check if we have any meal plan items
      const hasMealPlanItems = Object.values(generatedItems || {}).some(items => items.length > 0);
      
      if (hasMealPlanItems) {
        // If we have meal plan items, use them
        setShoppingList(generatedItems);
      } else {
        // If no meal plan items, load existing items
        const existingItems = await ShoppingListService.loadExistingShoppingList(currentHousehold.id);
        setShoppingList(existingItems || {});
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
  }, [user, currentHousehold, hasInitialized, generateItems, weekNumber, toast]);

  const generateFromMealPlans = useCallback(async () => {
    if (!user || !currentHousehold) return;

    setIsLoading(true);
    try {
      const generatedItems = generateItems(weekNumber);
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
  }, [user, currentHousehold, generateItems, weekNumber, toast]);

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
    const success = await ShoppingListService.toggleItemChecked(itemId, newCheckedState, currentHousehold.id);
    
    if (!success) {
      // Revert on error
      setShoppingList(prev => ({
        ...prev,
        [category]: prev[category]?.map(i => 
          i.id === itemId ? { ...i, isChecked: !newCheckedState } : i
        ) || []
      }));
    }
  }, [user, currentHousehold, shoppingList]);

  const addCustomItem = useCallback(async (name: string, category: string) => {
    if (!user || !currentHousehold || !name.trim()) return;

    const newItem = await ShoppingListService.addCustomItem(name, category, currentHousehold.id, user.id);
    
    if (newItem) {
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

  const removeItem = useCallback(async (itemId: string, category: string) => {
    if (!user || !currentHousehold) return;

    // Update local state immediately
    setShoppingList(prev => ({
      ...prev,
      [category]: prev[category]?.filter(i => i.id !== itemId) || []
    }));

    // Remove from database if it's a saved item
    const success = await ShoppingListService.removeItem(itemId, currentHousehold.id);
    
    if (!success) {
      toast({
        title: "Error",
        description: "Failed to remove item",
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
