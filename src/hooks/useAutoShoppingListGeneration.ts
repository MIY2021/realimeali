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
  
  // Track pending generations to prevent duplicates
  const pendingGenerationsRef = useRef<Set<string>>(new Set());
  // Track previous week keys to detect when weeks are cleared
  const previousWeekKeysRef = useRef<Set<string>>(new Set());
  // Prevent unrelated re-renders (such as checking a shopping-list item)
  // from regenerating and reordering the entire list.
  const lastGenerationSignatureRef = useRef<string | null>(null);

  // Watch meal plans and regenerate shopping lists
  useEffect(() => {
    if (!user || !currentHousehold || recipesLoading || mealPlansLoading || recipes.length === 0) {
      return;
    }

    const generationSignature = buildGenerationSignature(mealPlans, recipes);
    const isInitialGenerationCheck = lastGenerationSignatureRef.current === null;

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

      // Prevent duplicate generations
      if (pendingGenerationsRef.current.has(weekKey)) {
        return;
      }

      pendingGenerationsRef.current.add(weekKey);

      try {
        const existingItems = await ShoppingListService.loadExistingShoppingList(currentHousehold.id, weekKey);

        // The generation signature is in-memory, so it is always "new" after a
        // full page refresh. Do not replace an existing persisted list on that
        // first check: doing so can lose checked states (and custom items) when
        // ingredient normalisation or recipe IDs no longer match exactly.
        // Subsequent signature changes in this session still regenerate lists.
        if (isInitialGenerationCheck && existingItems.length > 0) {
          console.log(`[Auto-Generate] Keeping existing shopping list for ${weekKey} on initial load`);
          return;
        }

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
  }, [mealPlans, user, currentHousehold, recipesLoading, mealPlansLoading, recipes, generateAndSaveFromMealPlans, getMealPlansForWeek]);

  // Return empty object - no UI states needed
  return {};
};
