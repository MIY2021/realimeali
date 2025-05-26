
import { useState, useEffect, useCallback, useRef } from "react";
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
  
  // Use refs to track generation state without triggering re-renders
  const hasGeneratedRef = useRef<Set<string>>(new Set());
  const isGeneratingRef = useRef(false);

  // Generate a unique key for the current week/household combination
  const getGenerationKey = useCallback(() => {
    if (!currentHousehold) return null;
    return `${currentHousehold.id}-week-${weekNumber}`;
  }, [currentHousehold, weekNumber]);

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

  // Auto-generate shopping list from meal plans if needed
  const autoGenerateFromMealPlans = useCallback(async () => {
    if (!user || !currentHousehold || isGeneratingRef.current) return;

    const generationKey = getGenerationKey();
    if (!generationKey || hasGeneratedRef.current.has(generationKey)) return;

    const mealPlans = getMealPlansForWeek(weekNumber);
    
    // Only generate if we have meal plans
    if (mealPlans.length > 0) {
      // Check if shopping list is truly empty (not just loading)
      const allItems = Object.values(shoppingList).flat();
      if (allItems.length === 0 && !isLoading) {
        console.log('Auto-generating shopping list from meal plans for', generationKey);
        
        isGeneratingRef.current = true;
        hasGeneratedRef.current.add(generationKey);
        
        try {
          setIsLoading(true);
          await generateAndSaveFromMealPlans(weekNumber);
          // Don't call loadShoppingList here - let real-time sync handle it
        } catch (error) {
          console.error("Error auto-generating shopping list:", error);
          // Remove from generated set on error so user can retry
          hasGeneratedRef.current.delete(generationKey);
        } finally {
          setIsLoading(false);
          isGeneratingRef.current = false;
        }
      }
    }
  }, [user, currentHousehold, getMealPlansForWeek, weekNumber, generateAndSaveFromMealPlans, getGenerationKey, isLoading]);

  // Clear generation flag when week or household changes
  useEffect(() => {
    const generationKey = getGenerationKey();
    if (generationKey && !hasGeneratedRef.current.has(generationKey)) {
      // Reset the shopping list when switching weeks/households
      const emptyCategories: ShoppingListCategory = {};
      SHOPPING_CATEGORIES.forEach(cat => {
        emptyCategories[cat] = [];
      });
      setShoppingList(emptyCategories);
    }
  }, [getGenerationKey]);

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
          // Debounce the reload to prevent rapid-fire updates
          setTimeout(() => {
            if (!isGeneratingRef.current) {
              loadShoppingList();
            }
          }, 100);
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

  // Auto-generate ONLY when shopping list is loaded and empty
  useEffect(() => {
    // Only run auto-generation after shopping list is loaded
    if (!isLoading) {
      autoGenerateFromMealPlans();
    }
  }, [autoGenerateFromMealPlans, isLoading]);

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
        
        // Clear generation flag so it can generate again
        const generationKey = getGenerationKey();
        if (generationKey) {
          hasGeneratedRef.current.delete(generationKey);
        }

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
  }, [user, currentHousehold, toast, getGenerationKey]);

  return {
    shoppingList,
    isLoading,
    toggleItemChecked,
    addCustomItem,
    clearAll,
  };
};
