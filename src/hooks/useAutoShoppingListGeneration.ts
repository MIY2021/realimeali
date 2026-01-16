import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useShoppingListGenerator } from "@/hooks/useShoppingListGenerator";
import { ShoppingListService } from "@/services/shoppingListService";

const buildCheckedKey = (name: string, recipeId: string) => {
  return `${name.toLowerCase().trim()}::${recipeId}`;
};

/**
 * Automatically generates shopping lists when meal plans change.
 * Simple: meal plans change → shopping list regenerates
 */
export const useAutoShoppingListGeneration = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { recipes, isLoading: recipesLoading } = useRecipes();
  const { mealPlans, getMealPlansForWeek } = useMealPlan();
  const { generateAndSaveFromMealPlans } = useShoppingListGenerator();
  
  // Track pending generations to prevent duplicates
  const pendingGenerationsRef = useRef<Set<string>>(new Set());
  // Track previous week keys to detect when weeks are cleared
  const previousWeekKeysRef = useRef<Set<string>>(new Set());

  // Watch meal plans and regenerate shopping lists
  useEffect(() => {
    if (!user || !currentHousehold || recipesLoading || recipes.length === 0) {
      return;
    }

    console.log('[Auto-Generate] Meal plans changed, regenerating shopping lists...', mealPlans.length);

    // Get all unique week keys from meal plans
    const weekKeys = new Set<string>();
    mealPlans.forEach(plan => {
      if (plan.week_key) {
        weekKeys.add(plan.week_key);
      }
    });

    let cancelled = false;

    const clearWeeksWithoutMealPlans = async () => {
      const weeksWithShoppingLists = await ShoppingListService.getAllWeekKeysWithShoppingLists(currentHousehold.id);
      if (cancelled) {
        return;
      }

      const weeksToClear = weeksWithShoppingLists.filter(weekKey => !weekKeys.has(weekKey));
      await Promise.all(weeksToClear.map(async (weekKey) => {
        const cleared = await ShoppingListService.clearAll(currentHousehold.id, weekKey);
        if (cleared) {
          window.dispatchEvent(new CustomEvent('shopping-list-auto-generated', {
            detail: { weekKey }
          }));
        }
      }));
    };

    clearWeeksWithoutMealPlans().catch(err => {
      console.error('[Auto-Generate] Error clearing weeks without meal plans:', err);
    });

    // Clear shopping lists for weeks that no longer have meal plans
    previousWeekKeysRef.current.forEach(weekKey => {
      if (!weekKeys.has(weekKey)) {
        ShoppingListService.clearAll(currentHousehold.id, weekKey).catch(err => {
          console.error(`[Auto-Generate] Error clearing shopping list for ${weekKey}:`, err);
        });
        window.dispatchEvent(new CustomEvent('shopping-list-auto-generated', {
          detail: { weekKey }
        }));
      }
    });

    // Generate shopping list for each week that has meal plans (immediate)
    weekKeys.forEach(async (weekKey) => {
      const weekMealPlans = getMealPlansForWeek(weekKey);

      console.log(`[Auto-Generate] Regenerating for ${weekKey}, meal plans:`, weekMealPlans.length);

      if (weekMealPlans.length === 0) {
        // No meal plans - clear list
        await ShoppingListService.clearAll(currentHousehold.id, weekKey);
        window.dispatchEvent(new CustomEvent('shopping-list-auto-generated', {
          detail: { weekKey }
        }));
        return;
      }

      // Prevent duplicate generations
      if (pendingGenerationsRef.current.has(weekKey)) {
        return;
      }

      pendingGenerationsRef.current.add(weekKey);

      try {
        const existingItems = await ShoppingListService.loadExistingShoppingList(currentHousehold.id, weekKey);
        const checkedMap = new Map<string, boolean>();

        existingItems.forEach(item => {
          if (!item.isChecked) {
            return;
          }

          const recipeIds = item.recipeIds.length > 0 ? item.recipeIds : ["custom"];
          recipeIds.forEach(recipeId => {
            checkedMap.set(buildCheckedKey(item.name, recipeId), true);
          });
        });

        // Clear and regenerate with latest meal plans
        await ShoppingListService.clearAll(currentHousehold.id, weekKey);
        await generateAndSaveFromMealPlans(weekKey, checkedMap);

        console.log(`[Auto-Generate] Successfully regenerated shopping list for ${weekKey}`);

        // Dispatch event for real-time updates
        window.dispatchEvent(new CustomEvent('shopping-list-auto-generated', {
          detail: { weekKey }
        }));
      } catch (error) {
        console.error(`[Auto-Generate] Error generating shopping list for ${weekKey}:`, error);
      } finally {
        pendingGenerationsRef.current.delete(weekKey);
      }
    });

    // Update previous week keys after scheduling
    previousWeekKeysRef.current = new Set(weekKeys);

    // Cleanup
    return () => {
      cancelled = true;
    };
  }, [mealPlans, user, currentHousehold, recipesLoading, recipes, generateAndSaveFromMealPlans, getMealPlansForWeek]);

  // Return empty object - no UI states needed
  return {};
};
