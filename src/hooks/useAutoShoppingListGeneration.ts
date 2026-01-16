import { useEffect, useRef, useCallback, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useShoppingListGenerator } from "@/hooks/useShoppingListGenerator";
import { ShoppingListService } from "@/services/shoppingListService";
import { ShoppingListQueries } from "@/services/shoppingListService/shoppingListQueries";

/**
 * Automatically generates shopping lists when meal plans change.
 * Uses debouncing to avoid excessive processing.
 * 
 * @returns Object with isGenerating map (weekKey -> boolean) to track generation state per week
 */
export const useAutoShoppingListGeneration = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { recipes, isLoading: recipesLoading } = useRecipes();
  const { mealPlans } = useMealPlan();
  const { generateAndSaveFromMealPlans } = useShoppingListGenerator();
  
  // Track which weeks are currently generating
  const [generatingWeeks, setGeneratingWeeks] = useState<Set<string>>(new Set());
  // Track which weeks just finished generating (to show animation while items load)
  const [recentlyGeneratedWeeks, setRecentlyGeneratedWeeks] = useState<Set<string>>(new Set());
  // Track which weeks have pending generation
  const pendingGenerationsRef = useRef<Set<string>>(new Set());
  // Track debounce timers per week
  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  // Track last meal plan hash per week to detect actual changes
  const lastMealPlanHashRef = useRef<Map<string, string>>(new Map());

  // Create a hash of meal plans for a week to detect changes
  const getMealPlanHash = useCallback((weekKey: string): string => {
    const weekMealPlans = mealPlans.filter(plan => plan.week_key === weekKey);
    // Create a hash based on meal plan IDs and key properties
    const hashData = weekMealPlans
      .map(plan => `${plan.id}:${plan.recipe_id}:${plan.meal_type}:${plan.date}:${plan.is_leftover}:${plan.planned_servings}`)
      .sort()
      .join('|');
    return hashData;
  }, [mealPlans]);

  // Handle clearing shopping list when meal plans are removed
  const clearShoppingListForWeek = useCallback(async (weekKey: string) => {
    if (!user || !currentHousehold) return;

    try {
      console.log(`[Auto-Generate] Clearing shopping list for ${weekKey} (no meal plans)`);
      await ShoppingListService.clearAll(currentHousehold.id, weekKey);
      
      // Clear the hash so it will regenerate if meal plans are added back
      lastMealPlanHashRef.current.delete(weekKey);
      
      // Dispatch event to trigger refresh
      window.dispatchEvent(new CustomEvent('shopping-list-auto-generated', {
        detail: { weekKey, itemCount: 0 }
      }));
    } catch (error) {
      console.error(`[Auto-Generate] Error clearing shopping list for ${weekKey}:`, error);
    }
  }, [user, currentHousehold]);

  // Auto-generate shopping list for a specific week
  const autoGenerateForWeek = useCallback(async (weekKey: string) => {
    if (!user || !currentHousehold || recipesLoading || recipes.length === 0) {
      return;
    }

    const weekMealPlans = mealPlans.filter(plan => plan.week_key === weekKey);
    
    // If no meal plans, clear the shopping list immediately
    if (weekMealPlans.length === 0) {
      await clearShoppingListForWeek(weekKey);
      return;
    }

    // Check if we've already generated for this exact state
    const currentHash = getMealPlanHash(weekKey);
    const lastHash = lastMealPlanHashRef.current.get(weekKey);
    
    if (currentHash === lastHash && currentHash !== '') {
      // No changes detected, skip generation
      return;
    }

    // REMOVED: The check that assumes existing lists are up-to-date
    // This was preventing regeneration when meal plans changed
    // Now we always check hash and regenerate if different

    // Mark as pending to prevent duplicate generations
    if (pendingGenerationsRef.current.has(weekKey)) {
      return;
    }

    pendingGenerationsRef.current.add(weekKey);
    // Don't set generating state - generation is silent

    try {
      console.log(`[Auto-Generate] Generating shopping list for ${weekKey}`);
      
      // Clear existing items and generate new ones
      await ShoppingListService.clearAll(currentHousehold.id, weekKey);
      const result = await generateAndSaveFromMealPlans(weekKey);
      
      // Update hash after successful generation
      lastMealPlanHashRef.current.set(weekKey, currentHash);
      
      console.log(`[Auto-Generate] Generated ${result.length} items for ${weekKey}`);
      
      // Dispatch event - real-time subscription will update UI instantly
      window.dispatchEvent(new CustomEvent('shopping-list-auto-generated', {
        detail: { weekKey, itemCount: result.length }
      }));
    } catch (error) {
      console.error(`[Auto-Generate] Error generating shopping list for ${weekKey}:`, error);
    } finally {
      pendingGenerationsRef.current.delete(weekKey);
      // Don't set generating states - generation is silent
    }
  }, [user, currentHousehold, recipesLoading, recipes, mealPlans, generateAndSaveFromMealPlans, getMealPlanHash, clearShoppingListForWeek]);

  // Immediate generation function - no delay, start immediately
  const scheduleGeneration = useCallback((weekKey: string) => {
    // Clear any existing timer for this week
    const existingTimer = debounceTimersRef.current.get(weekKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Don't set generating state - generation is silent
    // Start generation immediately - no delay, speed is key!
    autoGenerateForWeek(weekKey);
  }, [autoGenerateForWeek]);

  // Track previously seen week keys to detect when weeks are cleared
  const previousWeekKeysRef = useRef<Set<string>>(new Set());
  // Track if we've done the initial validation check
  const hasDoneInitialValidationRef = useRef<boolean>(false);

  // Watch for meal plan changes and auto-generate
  useEffect(() => {
    if (!user || !currentHousehold) {
      return;
    }

    // Get all unique week keys from meal plans
    const currentWeekKeys = new Set<string>();
    mealPlans.forEach(plan => {
      if (plan.week_key) {
        currentWeekKeys.add(plan.week_key);
      }
    });

    // Check for weeks that were cleared (had meal plans before, but don't now)
    const previousWeekKeys = previousWeekKeysRef.current;
    previousWeekKeys.forEach(weekKey => {
      if (!currentWeekKeys.has(weekKey)) {
        // Week was cleared - clear shopping list immediately (no debounce)
        clearShoppingListForWeek(weekKey);
      }
    });


    // Update previous week keys
    previousWeekKeysRef.current = new Set(currentWeekKeys);

    // If recipes aren't loaded yet, wait
    if (recipesLoading || recipes.length === 0) {
      return;
    }

    // Schedule generation for each week that has meal plans
    currentWeekKeys.forEach(weekKey => {
      const weekMealPlans = mealPlans.filter(plan => plan.week_key === weekKey);
      if (weekMealPlans.length > 0) {
        scheduleGeneration(weekKey);
      }
    });

    // Check all weeks that have hashes (shopping lists) but no meal plans
    // This catches weeks that were cleared or never had meal plans but still have shopping lists
    lastMealPlanHashRef.current.forEach((hash, weekKey) => {
      if (hash && !currentWeekKeys.has(weekKey)) {
        const weekMealPlans = mealPlans.filter(plan => plan.week_key === weekKey);
        if (weekMealPlans.length === 0) {
          console.log(`[Auto-Generate] Week ${weekKey} has shopping list but no meal plans - clearing`);
          clearShoppingListForWeek(weekKey);
        }
      }
    });

    // Also: For any week that was in previousWeekKeys but is not in currentWeekKeys,
    // and we don't have a hash for it, we should still check if it needs clearing
    // This handles the case where a week had meal plans, they were cleared, but the hash wasn't set
    previousWeekKeys.forEach(weekKey => {
      if (!currentWeekKeys.has(weekKey) && !lastMealPlanHashRef.current.has(weekKey)) {
        // This week had meal plans before but doesn't now, and we don't have a hash
        // It's possible it has a shopping list from before - clear it to be safe
        const weekMealPlans = mealPlans.filter(plan => plan.week_key === weekKey);
        if (weekMealPlans.length === 0) {
          console.log(`[Auto-Generate] Week ${weekKey} had meal plans before but doesn't now - clearing shopping list`);
          clearShoppingListForWeek(weekKey);
        }
      }
    });

    // Cleanup function
    return () => {
      debounceTimersRef.current.forEach(timer => clearTimeout(timer));
      debounceTimersRef.current.clear();
    };
  }, [mealPlans, user, currentHousehold, recipesLoading, recipes, scheduleGeneration, clearShoppingListForWeek]);

  // Initial validation: On mount, check all weeks with shopping lists and clear any without meal plans
  useEffect(() => {
    if (!user || !currentHousehold || recipesLoading || recipes.length === 0 || hasDoneInitialValidationRef.current) {
      return;
    }

    // Do a one-time comprehensive check
    const doInitialValidation = async () => {
      try {
        console.log('[Auto-Generate] Running initial validation check...');
        const weeksWithShoppingLists = await ShoppingListQueries.getAllWeekKeysWithShoppingLists(currentHousehold.id);
        
        // Get all weeks that have meal plans
        const weeksWithMealPlans = new Set<string>();
        mealPlans.forEach(plan => {
          if (plan.week_key) {
            weeksWithMealPlans.add(plan.week_key);
          }
        });

        // Clear shopping lists for weeks that don't have meal plans
        for (const weekKey of weeksWithShoppingLists) {
          if (!weeksWithMealPlans.has(weekKey)) {
            const weekMealPlans = mealPlans.filter(plan => plan.week_key === weekKey);
            if (weekMealPlans.length === 0) {
              console.log(`[Auto-Generate] Initial validation: Week ${weekKey} has shopping list but no meal plans - clearing`);
              await clearShoppingListForWeek(weekKey);
            }
          }
        }

        hasDoneInitialValidationRef.current = true;
        console.log('[Auto-Generate] Initial validation complete');
      } catch (error) {
        console.error('[Auto-Generate] Error in initial validation:', error);
      }
    };

    doInitialValidation();
  }, [user, currentHousehold, recipesLoading, recipes, mealPlans, clearShoppingListForWeek]);

  // Periodic validation: Check for weeks with shopping lists but no meal plans
  // This catches edge cases where a week has a shopping list but no meal plans
  // (e.g., if meal plans were cleared after initial validation)
  useEffect(() => {
    if (!user || !currentHousehold || recipesLoading || recipes.length === 0) {
      return;
    }

    // Run validation check every 30 seconds to catch any missed cases
    // This is a safety net for edge cases
    const validationInterval = setInterval(() => {
      // Get all weeks that have meal plans
      const weeksWithMealPlans = new Set<string>();
      mealPlans.forEach(plan => {
        if (plan.week_key) {
          weeksWithMealPlans.add(plan.week_key);
        }
      });

      // Check all weeks that have hashes (meaning they had shopping lists generated)
      // If they no longer have meal plans, clear the shopping list
      lastMealPlanHashRef.current.forEach((hash, weekKey) => {
        if (hash && !weeksWithMealPlans.has(weekKey)) {
          const weekMealPlans = mealPlans.filter(plan => plan.week_key === weekKey);
          if (weekMealPlans.length === 0) {
            console.log(`[Auto-Generate] Periodic validation: Week ${weekKey} has shopping list but no meal plans - clearing`);
            clearShoppingListForWeek(weekKey);
          }
        }
      });
    }, 30000); // Check every 30 seconds (less aggressive)

    return () => {
      clearInterval(validationInterval);
    };
  }, [user, currentHousehold, recipesLoading, recipes, mealPlans, clearShoppingListForWeek]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debounceTimersRef.current.forEach(timer => clearTimeout(timer));
      debounceTimersRef.current.clear();
      pendingGenerationsRef.current.clear();
    };
  }, []);

  // Helper to check if a specific week is generating or just finished generating
  const isGenerating = useCallback((weekKey: string) => {
    return generatingWeeks.has(weekKey) || recentlyGeneratedWeeks.has(weekKey);
  }, [generatingWeeks, recentlyGeneratedWeeks]);

  return { isGenerating };
};

