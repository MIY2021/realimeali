import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useShoppingListGenerator } from "@/hooks/useShoppingListGenerator";
import { ShoppingListService } from "@/services/shoppingListService";
import { getCurrentWeekKey } from "@/utils/weekUtils";

const buildCheckedKey = (name: string, recipeId: string) => {
  return `${name.toLowerCase().trim()}::${recipeId}`;
};

const buildGenerationSignature = (mealPlans: any[], recipes: any[]) => {
  const mealPlanSignature = mealPlans
    .map(plan => ({
      id: plan.id,
      week_key: plan.week_key,
      recipe_id: plan.recipe_id,
      meal_name: plan.meal_name,
      is_freetyped: plan.is_freetyped,
      is_leftover: plan.is_leftover,
      planned_servings: plan.planned_servings,
      original_servings: plan.original_servings,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const relevantRecipeIds = new Set(
    mealPlans
      .filter(plan => !plan.is_leftover && !plan.is_freetyped && plan.recipe_id)
      .map(plan => plan.recipe_id)
  );

  const recipeSignature = recipes
    .filter(recipe => relevantRecipeIds.has(recipe.id))
    .map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      servings: recipe.servings,
      ingredients: recipe.ingredients,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  return JSON.stringify({ mealPlans: mealPlanSignature, recipes: recipeSignature });
};

/**
 * Automatically generates shopping lists when meal plans change.
 * Simple: meal plans change → shopping list regenerates
 */
export const useAutoShoppingListGeneration = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { recipes, isLoading: recipesLoading } = useRecipes();
  const { mealPlans, getMealPlansForWeek, isLoading: mealPlansLoading } = useMealPlan();
  const { generateAndSaveFromMealPlans } = useShoppingListGenerator();
  
  // Track pending generations to prevent duplicates.
  const pendingGenerationsRef = useRef<Set<string>>(new Set());
  // If meal plans change during an in-flight generation, queue a second pass
  // instead of silently dropping the latest serving count.
  const rerunRequestedRef = useRef<Set<string>>(new Set());
  const [generationRevision, setGenerationRevision] = useState(0);
  // Track previous week keys to detect when weeks are cleared.
  const previousWeekKeysRef = useRef<Set<string>>(new Set());
  // Prevent unrelated re-renders (such as checking a shopping-list item)
  // from regenerating and reordering the entire list.
  const lastGenerationSignatureRef = useRef<string | null>(null);

  // Watch meal plans and regenerate shopping lists
  useEffect(() => {
    if (!user || !currentHousehold || recipesLoading || mealPlansLoading || recipes.length === 0) {
      return;
    }

    // MealPlanContext starts with an empty array before the parallel loader has
    // fetched persisted plans. Its loading flag also starts false, so do not
    // treat the initial empty state as a real "all meal plans removed" update.
    // Once this hook has seen plans, however, an empty plan array is meaningful:
    // clear the saved lists for the weeks that were previously populated.
    if (mealPlans.length === 0) {
      if (previousWeekKeysRef.current.size === 0) {
        return;
      }

      const weeksToClear = new Set(previousWeekKeysRef.current);
      previousWeekKeysRef.current.clear();
      lastGenerationSignatureRef.current = JSON.stringify({ mealPlans: [], recipes: [] });

      void Promise.all([...weeksToClear].map(async weekKey => {
        // A meal plan may be added again while the deletes are in flight.
        // Only clear while the empty-plan signature is still the latest state.
        if (lastGenerationSignatureRef.current !== JSON.stringify({ mealPlans: [], recipes: [] })) {
          return;
        }
        const cleared = await ShoppingListService.clearAll(currentHousehold.id, weekKey);
        if (cleared) {
          window.dispatchEvent(new CustomEvent('shopping-list-auto-generated', {
            detail: { weekKey }
          }));
        }
      })).catch(err => {
        // If clearing fails, allow the next relevant render to retry.
        lastGenerationSignatureRef.current = null;
        console.error('[Auto-Generate] Error clearing lists after all meal plans were removed:', err);
      });
      return;
    }

    const generationSignature = buildGenerationSignature(mealPlans, recipes);
    if (lastGenerationSignatureRef.current === generationSignature) {
      return;
    }

    lastGenerationSignatureRef.current = generationSignature;

    console.log('[Auto-Generate] Meal plans/recipes changed, regenerating shopping lists...', mealPlans.length);

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

    // Regenerate current/upcoming weeks first, then historical weeks. The old
    // implementation fired every week at once; large households could overwhelm
    // PostgREST/AI normalization, leaving some weeks stale without a retry.
    const currentWeekKey = getCurrentWeekKey();
    const orderedWeekKeys = [...weekKeys].sort((a, b) => {
      const aPriority = a >= currentWeekKey ? 0 : 1;
      const bPriority = b >= currentWeekKey ? 0 : 1;
      return aPriority - bPriority || a.localeCompare(b);
    });

    const regenerateWeekLists = async () => {
      for (const weekKey of orderedWeekKeys) {
        // React effect cleanup runs on dependency changes as well as unmounts.
        // Do not cancel this queue mid-run: the generation signature is already
        // recorded, so cancelling here can leave later weeks stale indefinitely.
        const weekMealPlans = getMealPlansForWeek(weekKey);
        console.log(`[Auto-Generate] Regenerating for ${weekKey}, meal plans: `, weekMealPlans.length);

        if (weekMealPlans.length === 0) {
          await ShoppingListService.clearAll(currentHousehold.id, weekKey);
          window.dispatchEvent(new CustomEvent('shopping-list-auto-generated', {
            detail: { weekKey }
          }));
          continue;
        }

        // If servings or ingredients changed while this week was generating,
        // queue a fresh pass after the current write completes.
        if (pendingGenerationsRef.current.has(weekKey)) {
          rerunRequestedRef.current.add(weekKey);
          continue;
        }

        pendingGenerationsRef.current.add(weekKey);

        try {
          let succeeded = false;

          // Retry once after a short pause. The generator intentionally returns
          // [] on failure to protect the existing list, so empty output is not
          // success and must not silently leave a stale list indefinitely.
          for (let attempt = 1; attempt <= 2 && !succeeded; attempt++) {
            try {
              const existingItems = await ShoppingListService.loadExistingShoppingList(
                currentHousehold.id,
                weekKey
              );

              const checkedMap = new Map<string, boolean>();
              existingItems.forEach(item => {
                if (!item.isChecked) return;

                const recipeIds = item.recipeIds.length > 0 ? item.recipeIds : ["custom"];
                recipeIds.forEach(recipeId => {
                  checkedMap.set(buildCheckedKey(item.name, recipeId), true);
                  (item.sourceIngredients || []).forEach(sourceIngredient => {
                    checkedMap.set(buildCheckedKey(sourceIngredient, recipeId), true);
                  });
                });
              });

              const generatedItems = await generateAndSaveFromMealPlans(
                weekKey,
                checkedMap,
                existingItems.filter(item => item.isCustom)
              );

              if (generatedItems.length > 0) {
                succeeded = true;
                console.log(`[Auto-Generate] Successfully regenerated shopping list for ${weekKey} on attempt ${attempt}`);
                window.dispatchEvent(new CustomEvent('shopping-list-auto-generated', {
                  detail: { weekKey }
                }));
              } else {
                console.error(`[Auto-Generate] Attempt ${attempt} returned no items for ${weekKey}`);
              }
            } catch (error) {
              console.error(`[Auto-Generate] Attempt ${attempt} failed for ${weekKey}:`, error);
            }

            if (!succeeded && attempt < 2) {
              await new Promise(resolve => window.setTimeout(resolve, 1500));
            }
          }

          if (!succeeded) {
            console.error(`[Auto-Generate] Giving up after retry for ${weekKey}; existing list was preserved`);
          }
        } finally {
          pendingGenerationsRef.current.delete(weekKey);

          // Never lose the latest serving change just because an earlier
          // generation was still in flight when the user tapped + or -.
          if (rerunRequestedRef.current.delete(weekKey)) {
            lastGenerationSignatureRef.current = null;
            setGenerationRevision(revision => revision + 1);
          }
        }
      }
    };

    void regenerateWeekLists();

    // Update previous week keys after scheduling
    previousWeekKeysRef.current = new Set(weekKeys);

    // Cleanup
    return () => {
      cancelled = true;
    };
  }, [mealPlans, user, currentHousehold, recipesLoading, mealPlansLoading, recipes, generateAndSaveFromMealPlans, getMealPlansForWeek, generationRevision]);

  // Return empty object - no UI states needed
  return {};
};
