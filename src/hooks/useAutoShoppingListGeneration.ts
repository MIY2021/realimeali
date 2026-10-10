import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useShoppingListGenerator } from "@/hooks/useShoppingListGenerator";
import { ShoppingListService } from "@/services/shoppingListService";

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
    // fetched persisted plans. Its loading flag also starts false, so without
    // this guard the first render can treat that temporary empty array as the
    // real plan, clear existing shopping lists, and record an empty signature.
    // Wait until at least one persisted plan is present before running any
    // cleanup or generation. Empty plans must never implicitly delete a list.
    if (mealPlans.length === 0) {
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

      // If servings or ingredients changed while this week was generating,
      // remember to run again after the current write completes.
      if (pendingGenerationsRef.current.has(weekKey)) {
        rerunRequestedRef.current.add(weekKey);
        return;
      }

      pendingGenerationsRef.current.add(weekKey);

      try {
        const existingItems = await ShoppingListService.loadExistingShoppingList(currentHousehold.id, weekKey);

        // Refresh the list on initial load too, so saved quantities stay in sync
        // with the current planned servings. The generator receives checked states
        // and custom items to preserve both while recalculating recipe quantities.

        const checkedMap = new Map<string, boolean>();

        existingItems.forEach(item => {
          if (!item.isChecked) {
            return;
          }

          const recipeIds = item.recipeIds.length > 0 ? item.recipeIds : ["custom"];
          recipeIds.forEach(recipeId => {
            checkedMap.set(buildCheckedKey(item.name, recipeId), true);
            (item.sourceIngredients || []).forEach(sourceIngredient => {
              checkedMap.set(buildCheckedKey(sourceIngredient, recipeId), true);
            });
          });
        });

        // Regenerate atomically. The generator replaces the list only after it
        // has successfully prepared a non-empty set of items, so a temporary
        // AI/network failure can never wipe an existing shopping list.
        const generatedItems = await generateAndSaveFromMealPlans(
          weekKey,
          checkedMap,
          existingItems.filter(item => item.isCustom)
        );

        if (generatedItems.length === 0) {
          console.error(`[Auto-Generate] Generation returned no items for ${weekKey}; keeping the existing list`);
          return;
        }

        console.log(`[Auto-Generate] Successfully regenerated shopping list for ${weekKey}`);

        // Dispatch event only after the generator confirms a successful save.
        window.dispatchEvent(new CustomEvent('shopping-list-auto-generated', {
          detail: { weekKey }
        }));
      } catch (error) {
        console.error(`[Auto-Generate] Error generating shopping list for ${weekKey}:`, error);
      } finally {
        pendingGenerationsRef.current.delete(weekKey);

        // Never lose the latest serving change just because an earlier
        // generation was still in flight when the user tapped + or -.
        if (rerunRequestedRef.current.delete(weekKey)) {
          lastGenerationSignatureRef.current = null;
          setGenerationRevision(revision => revision + 1);
        }
      }
    });

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
