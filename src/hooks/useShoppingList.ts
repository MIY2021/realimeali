
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useToast } from "@/hooks/use-toast";
import { ShoppingListItem } from "@/types/shoppingList";
import { ShoppingListService } from "@/services/shoppingListService";
import { useShoppingListGenerator } from "@/hooks/useShoppingListGenerator";
import { supabase } from "@/integrations/supabase/client";

export const useShoppingList = (weekNumber: 1 | 2) => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { getMealPlansForWeek } = useMealPlan();
  const { toast } = useToast();
  const { generateAndSaveFromMealPlans } = useShoppingListGenerator();
  
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use refs to prevent re-renders and track state
  const hasGeneratedRef = useRef<Set<string>>(new Set());
  const isGeneratingRef = useRef(false);
  const lastLoadTimeRef = useRef<number>(0);
  const generationCooldownRef = useRef<Map<string, number>>(new Map());

  const generationKey = currentHousehold ? `${currentHousehold.id}-week-${weekNumber}` : null;

  const loadShoppingList = useCallback(async () => {
    if (!user || !currentHousehold) return;

    const now = Date.now();
    if (now - lastLoadTimeRef.current < 500) {
      console.log('Skipping load - too frequent');
      return;
    }
    lastLoadTimeRef.current = now;

    setIsLoading(true);
    try {
      const items = await ShoppingListService.loadExistingShoppingList(currentHousehold.id, weekNumber);
      setShoppingList(items);
    } catch (error) {
      console.error("Error loading shopping list:", error);
      setShoppingList([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentHousehold, weekNumber]);

  const autoGenerateFromMealPlans = useCallback(async () => {
    if (!user || !currentHousehold || !generationKey || isGeneratingRef.current) {
      return;
    }

    const lastGeneration = generationCooldownRef.current.get(generationKey);
    const now = Date.now();
    if (lastGeneration && now - lastGeneration < 5000) {
      console.log('Generation on cooldown for', generationKey);
      return;
    }

    if (hasGeneratedRef.current.has(generationKey)) {
      return;
    }

    const mealPlans = getMealPlansForWeek(weekNumber);
    
    if (mealPlans.length > 0) {
      const hasExistingItems = await ShoppingListService.checkDatabaseForItems(currentHousehold.id, weekNumber);
      
      if (!hasExistingItems) {
        console.log('Auto-generating consolidated shopping list for', generationKey);
        
        isGeneratingRef.current = true;
        hasGeneratedRef.current.add(generationKey);
        generationCooldownRef.current.set(generationKey, now);
        
        try {
          setIsLoading(true);
          await generateAndSaveFromMealPlans(weekNumber);
        } catch (error) {
          console.error("Error auto-generating shopping list:", error);
          hasGeneratedRef.current.delete(generationKey);
          generationCooldownRef.current.delete(generationKey);
        } finally {
          setIsLoading(false);
          isGeneratingRef.current = false;
        }
      }
    }
  }, [user, currentHousehold, getMealPlansForWeek, weekNumber, generateAndSaveFromMealPlans, generationKey]);

  // Real-time subscription
  useEffect(() => {
    if (!currentHousehold) return;

    let debounceTimer: NodeJS.Timeout;

    const channel = supabase
      .channel(`shopping-list-changes-week-${weekNumber}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'household_shopping_lists',
          filter: `household_id=eq.${currentHousehold.id}.and.week_number=eq.${weekNumber}`
        },
        (payload) => {
          console.log('Shopping list changed for week', weekNumber, ':', payload);
          
          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }
          
          debounceTimer = setTimeout(() => {
            if (!isGeneratingRef.current && !isLoading) {
              loadShoppingList();
            }
          }, 1000);
        }
      )
      .subscribe();

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      supabase.removeChannel(channel);
    };
  }, [currentHousehold, loadShoppingList, isLoading, weekNumber]);

  useEffect(() => {
    loadShoppingList();
  }, [loadShoppingList]);

  useEffect(() => {
    if (!isLoading && generationKey) {
      const timer = setTimeout(() => {
        autoGenerateFromMealPlans();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [autoGenerateFromMealPlans, isLoading, generationKey]);

  const toggleItemChecked = useCallback(async (itemId: string) => {
    if (!user || !currentHousehold) return;

    const item = shoppingList.find(i => i.id === itemId);
    if (!item) return;

    const newCheckedState = !item.isChecked;

    // Update local state immediately
    setShoppingList(prev => prev.map(i => 
      i.id === itemId ? { ...i, isChecked: newCheckedState } : i
    ));

    // Update database
    const success = await ShoppingListService.toggleItemChecked(itemId, newCheckedState, currentHousehold.id);
    
    if (!success) {
      // Revert on error
      setShoppingList(prev => prev.map(i => 
        i.id === itemId ? { ...i, isChecked: !newCheckedState } : i
      ));
      
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  }, [user, currentHousehold, shoppingList, toast]);

  const addCustomItem = useCallback(async (name: string) => {
    if (!user || !currentHousehold || !name.trim()) return;

    const newItem = await ShoppingListService.addCustomItem(name, currentHousehold.id, user.id, weekNumber);
    
    if (newItem) {
      setShoppingList(prev => [...prev, newItem]);

      toast({
        title: "Item added",
        description: `${name} added to shopping list`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    }
  }, [user, currentHousehold, toast, weekNumber]);

  const clearAll = useCallback(async () => {
    if (!user || !currentHousehold) return;

    setIsLoading(true);
    try {
      const success = await ShoppingListService.clearAll(currentHousehold.id, weekNumber);
      
      if (success) {
        setShoppingList([]);
        
        if (generationKey) {
          hasGeneratedRef.current.delete(generationKey);
          generationCooldownRef.current.delete(generationKey);
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
  }, [user, currentHousehold, toast, generationKey, weekNumber]);

  return {
    shoppingList,
    isLoading,
    toggleItemChecked,
    addCustomItem,
    clearAll,
  };
};
