
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  
  // Initialize with empty categories to prevent layout flickering
  const [shoppingList, setShoppingList] = useState<ShoppingListCategory>(() => {
    const emptyCategories: ShoppingListCategory = {};
    SHOPPING_CATEGORIES.forEach(cat => {
      emptyCategories[cat] = [];
    });
    return emptyCategories;
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Use refs to prevent re-renders and track state
  const hasGeneratedRef = useRef<Set<string>>(new Set());
  const isGeneratingRef = useRef(false);
  const lastLoadTimeRef = useRef<number>(0);
  const generationCooldownRef = useRef<Map<string, number>>(new Map());
  const realtimeUpdateCountRef = useRef(0);

  // Memoize generation key to prevent unnecessary re-renders
  const generationKey = useMemo(() => {
    if (!currentHousehold) return null;
    return `${currentHousehold.id}-week-${weekNumber}`;
  }, [currentHousehold?.id, weekNumber]);

  // Stable load function with week-specific loading
  const loadShoppingList = useCallback(async () => {
    if (!user || !currentHousehold) return;

    const now = Date.now();
    // Prevent rapid reloads
    if (now - lastLoadTimeRef.current < 500) {
      console.log('Skipping load - too frequent');
      return;
    }
    lastLoadTimeRef.current = now;

    setIsLoading(true);
    try {
      const existingItems = await ShoppingListService.loadExistingShoppingList(currentHousehold.id, weekNumber);
      setShoppingList(existingItems || {});
    } catch (error) {
      console.error("Error loading shopping list:", error);
      // Initialize with empty categories on error
      const emptyCategories: ShoppingListCategory = {};
      SHOPPING_CATEGORIES.forEach(cat => {
        emptyCategories[cat] = [];
      });
      setShoppingList(emptyCategories);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentHousehold, weekNumber]);

  // Auto-generate with database-first approach and cooldown
  const autoGenerateFromMealPlans = useCallback(async () => {
    if (!user || !currentHousehold || !generationKey || isGeneratingRef.current) {
      return;
    }

    // Check cooldown period
    const lastGeneration = generationCooldownRef.current.get(generationKey);
    const now = Date.now();
    if (lastGeneration && now - lastGeneration < 5000) { // 5 second cooldown
      console.log('Generation on cooldown for', generationKey);
      return;
    }

    // Check if already generated for this key
    if (hasGeneratedRef.current.has(generationKey)) {
      return;
    }

    const mealPlans = getMealPlansForWeek(weekNumber);
    
    // Only generate if we have meal plans
    if (mealPlans.length > 0) {
      // Check database directly for week-specific items
      const hasExistingItems = await ShoppingListService.checkDatabaseForItems(currentHousehold.id, weekNumber);
      
      if (!hasExistingItems) {
        console.log('Auto-generating shopping list from meal plans for', generationKey);
        
        isGeneratingRef.current = true;
        hasGeneratedRef.current.add(generationKey);
        generationCooldownRef.current.set(generationKey, now);
        
        try {
          setIsLoading(true);
          await generateAndSaveFromMealPlans(weekNumber);
          // Let real-time sync handle the update
        } catch (error) {
          console.error("Error auto-generating shopping list:", error);
          // Remove from generated set on error so user can retry
          hasGeneratedRef.current.delete(generationKey);
          generationCooldownRef.current.delete(generationKey);
        } finally {
          setIsLoading(false);
          isGeneratingRef.current = false;
        }
      }
    }
  }, [user, currentHousehold, getMealPlansForWeek, weekNumber, generateAndSaveFromMealPlans, generationKey]);

  // Clear generation flags when generation key changes
  useEffect(() => {
    if (generationKey) {
      console.log('Generation key changed to:', generationKey);
    }
  }, [generationKey]);

  // Optimized real-time subscription with week filtering
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
          
          // Increment update counter for circuit breaker
          realtimeUpdateCountRef.current++;
          
          // Circuit breaker: if too many updates in short time, ignore
          if (realtimeUpdateCountRef.current > 10) {
            console.log('Circuit breaker: too many real-time updates, ignoring');
            return;
          }
          
          // Reset counter after a delay
          setTimeout(() => {
            realtimeUpdateCountRef.current = 0;
          }, 10000);

          // Clear any existing timer
          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }
          
          // Debounce with longer delay and proper guards
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

  // Load shopping list when dependencies change
  useEffect(() => {
    loadShoppingList();
  }, [loadShoppingList]);

  // Auto-generate with proper guards
  useEffect(() => {
    // Only run auto-generation after initial load and with proper delays
    if (!isLoading && generationKey) {
      const timer = setTimeout(() => {
        autoGenerateFromMealPlans();
      }, 1000); // Delay auto-generation

      return () => clearTimeout(timer);
    }
  }, [autoGenerateFromMealPlans, isLoading, generationKey]);

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

    const newItem = await ShoppingListService.addCustomItem(name, category, currentHousehold.id, user.id, weekNumber);
    
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
  }, [user, currentHousehold, toast, weekNumber]);

  const clearAll = useCallback(async () => {
    if (!user || !currentHousehold) return;

    setIsLoading(true);
    try {
      const success = await ShoppingListService.clearAll(currentHousehold.id, weekNumber);
      
      if (success) {
        const emptyCategories: ShoppingListCategory = {};
        SHOPPING_CATEGORIES.forEach(cat => {
          emptyCategories[cat] = [];
        });
        
        setShoppingList(emptyCategories);
        
        // Clear generation flag so it can generate again
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
