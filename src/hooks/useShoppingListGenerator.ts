import { useCallback } from "react";
import { ShoppingListItem } from "@/types/shoppingList";
import { useRecipes } from "@/contexts/RecipesContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { ShoppingListService } from "@/services/shoppingListService";
import { batchGetCategoriesFromDatabase, normalizeShoppingIngredients } from "@/services/ingredientCategorizationService";
import { DEFAULT_INGREDIENT_CATEGORY } from "@/types/ingredientCategories";
import { supabase } from "@/integrations/supabase/client";
import { parseShoppingIngredient } from "@/utils/shoppingIngredientUtils";

// Helper function to detect ingredient group headers
const isHeader = (ingredient: string) => {
  return ingredient.trim().endsWith(':') && !ingredient.match(/\d+.*:/);
};

const formatScaledQuantity = (value: number): string => {
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
};

const buildCheckedKey = (name: string, recipeId: string) => {
  return `${name.toLowerCase().trim()}::${recipeId}`;
};

export const useShoppingListGenerator = () => {
  const { recipes } = useRecipes();
  const { getMealPlansForWeek } = useMealPlan();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();

  const generateAndSaveFromMealPlans = useCallback(async (
    weekKey: string,
    checkedMap?: Map<string, boolean>,
    existingCustomItems: ShoppingListItem[] = []
  ): Promise<ShoppingListItem[]> => {
    console.log('=== STARTING SHOPPING LIST GENERATION ===');

    if (!recipes.length || !user || !currentHousehold) {
      return [];
    }

    const mealPlans = getMealPlansForWeek(weekKey);
    if (!mealPlans.length) {
      return [];
    }

    try {
      // Collect recipe ingredients while retaining the original text.
      const ingredientItems: Array<{
        rawName: string;
        recipeId: string;
        recipeTitle: string;
        servingScale: number;
      }> = [];

      mealPlans.forEach(mealPlan => {
        if (mealPlan.is_leftover) return;

        if (mealPlan.is_freetyped && mealPlan.meal_name) {
          ingredientItems.push({
            rawName: `Everything for ${mealPlan.meal_name}`,
            recipeId: mealPlan.id,
            recipeTitle: mealPlan.meal_name,
            servingScale: 1
          });
          return;
        }

        const recipe = recipes.find(r => r.id === mealPlan.recipe_id);
        if (!recipe) return;

        // Use the serving count captured when this meal was added; the recipe may
        // have been edited since then. Fall back to the current recipe serving count.
        const standardServings = mealPlan.original_servings || recipe.servings || 1;
        const plannedServings = mealPlan.planned_servings || standardServings;
        const servingScale = plannedServings / standardServings;

        recipe.ingredients.forEach(ingredient => {
          const trimmed = ingredient?.trim();
          if (!trimmed || trimmed === 'undefined' || trimmed === 'null' || isHeader(trimmed)) {
            return;
          }

          const lowerTrimmed = trimmed.toLowerCase();
          if (
            lowerTrimmed === 'water' ||
            lowerTrimmed === 'water,' ||
            lowerTrimmed.startsWith('water ') ||
            lowerTrimmed === 'cold water' ||
            lowerTrimmed === 'hot water' ||
            lowerTrimmed === 'warm water' ||
            lowerTrimmed === 'boiling water' ||
            lowerTrimmed === 'room temperature water'
          ) {
            return;
          }

          ingredientItems.push({
            rawName: trimmed,
            recipeId: recipe.id,
            recipeTitle: recipe.title,
            servingScale
          });
        });
      });

      if (ingredientItems.length === 0) return [];

      const uniqueRawNames = [...new Set(ingredientItems.map(item => item.rawName))];

      // Categories can use the existing local/database cache, but shopping names
      // are always semantically normalised from the current ingredient text.
      // This deliberately avoids trusting old cleaned_name cache entries created
      // by earlier versions of the normaliser.
      const categoryMap = await batchGetCategoriesFromDatabase(uniqueRawNames);
      const shoppingNameMap = await normalizeShoppingIngredients(uniqueRawNames);

      type PreparedItem = {
        name: string;
        quantity?: number;
        quantityMin?: number;
        quantityMax?: number;
        quantityDisplay?: string;
        unit?: string;
        recipeId: string;
        rawName: string;
        category: string;
      };

      const preparedItems: PreparedItem[] = ingredientItems
        .map(item => {
          const parsed = parseShoppingIngredient(item.rawName);
          const key = item.rawName.toLowerCase().trim();
          const categoryData = categoryMap.get(key);
          const normalizedData = shoppingNameMap.get(key);

          // The AI normaliser supplies the supermarket search name. The local
          // parser is only a safety net if the model accidentally includes an
          // amount in its response.
          const aiName = normalizedData?.shoppingName?.trim();
          const normalizedParsed = aiName ? parseShoppingIngredient(aiName) : null;
          const name = normalizedParsed?.searchName || aiName || parsed.searchName;

          if (!name || name.toLowerCase() === 'water') {
            return null;
          }

          const scale = item.servingScale;
          const quantity = parsed.quantity === undefined ? undefined : parsed.quantity * scale;
          const quantityMin = parsed.quantityMin === undefined ? undefined : parsed.quantityMin * scale;
          const quantityMax = parsed.quantityMax === undefined ? undefined : parsed.quantityMax * scale;
          const quantityDisplay = quantityMin !== undefined && quantityMax !== undefined
            ? (quantityMin === quantityMax
              ? formatScaledQuantity(quantityMin)
              : `${formatScaledQuantity(quantityMin)}–${formatScaledQuantity(quantityMax)}`)
            : quantity === undefined
              ? parsed.quantityDisplay
              : formatScaledQuantity(quantity);

          return {
            name,
            quantity,
            quantityMin,
            quantityMax,
            quantityDisplay,
            unit: parsed.unit,
            recipeId: item.recipeId,
            rawName: item.rawName,
            category: normalizedData?.category || categoryData?.category || DEFAULT_INGREDIENT_CATEGORY
          };
        })
        .filter((item): item is PreparedItem => item !== null);

      // Consolidate identical supermarket items. Different units stay separate
      // because 500g and 2 tins are not safely interchangeable.
      const grouped = new Map<string, {
        name: string;
        quantity?: number;
        quantityMin?: number;
        quantityMax?: number;
        quantityDisplay?: string;
        unit?: string;
        recipeIds: string[];
        sourceIngredients: string[];
        category: string;
        checked: boolean;
      }>();

      preparedItems.forEach(item => {
        const groupKey = `${item.name.toLowerCase().trim()}::${item.unit || ''}`;
        const existing = grouped.get(groupKey);
        const recipeChecked = checkedMap?.get(buildCheckedKey(item.name, item.recipeId)) ??
          checkedMap?.get(buildCheckedKey(item.rawName, item.recipeId)) ??
          false;

        if (!existing) {
          grouped.set(groupKey, {
            name: item.name,
            quantity: item.quantity,
            quantityMin: item.quantityMin,
            quantityMax: item.quantityMax,
            quantityDisplay: item.quantityDisplay,
            unit: item.unit,
            recipeIds: [item.recipeId],
            sourceIngredients: [item.rawName],
            category: item.category,
            checked: recipeChecked
          });
          return;
        }

        if (item.quantity !== undefined && existing.quantity !== undefined) {
          existing.quantity += item.quantity;
        } else if (existing.quantity === undefined) {
          existing.quantity = item.quantity;
        }

        if (item.quantityMin !== undefined && item.quantityMax !== undefined) {
          existing.quantityMin = (existing.quantityMin ?? 0) + item.quantityMin;
          existing.quantityMax = (existing.quantityMax ?? 0) + item.quantityMax;
        }

        if (existing.quantityMin !== undefined && existing.quantityMax !== undefined) {
          existing.quantityDisplay = existing.quantityMin === existing.quantityMax
            ? String(existing.quantityMin)
            : `${existing.quantityMin}–${existing.quantityMax}`;
        }

        if (!existing.recipeIds.includes(item.recipeId)) {
          existing.recipeIds.push(item.recipeId);
        }
        if (!existing.sourceIngredients.includes(item.rawName)) {
          existing.sourceIngredients.push(item.rawName);
        }
        existing.checked = existing.checked || recipeChecked;
      });

      const itemsToInsert: any[] = Array.from(grouped.values()).map(item => ({
        household_id: currentHousehold.id,
        created_by: user.id,
        name: item.name,
        week_key: weekKey,
        is_custom: false,
        is_checked: item.checked,
        recipe_ids: item.recipeIds,
        quantity: item.quantity,
        quantity_display: item.quantityDisplay,
        unit: item.unit || '',
        consolidated_quantity: item.quantity ?? 1,
        consolidated_unit: item.unit || '',
        source_ingredients: item.sourceIngredients,
        category: item.category
      }));

      // Preserve user-added items when refreshing the generated list.
      itemsToInsert.push(...existingCustomItems.filter(item => item.isCustom).map(item => ({
        household_id: currentHousehold.id,
        created_by: user.id,
        name: item.name,
        week_key: weekKey,
        is_custom: true,
        is_checked: item.isChecked,
        recipe_ids: item.recipeIds || [],
        quantity: item.quantity,
        quantity_display: item.quantityDisplay,
        unit: item.unit || '',
        consolidated_quantity: item.consolidatedQuantity ?? item.quantity ?? 1,
        consolidated_unit: item.consolidatedUnit ?? item.unit ?? '',
        source_ingredients: item.sourceIngredients || [],
        category: item.category || DEFAULT_INGREDIENT_CATEGORY
      })));

      if (itemsToInsert.length === 0) return [];

      // Replace the week's list atomically. This prevents the old list being
      // deleted before a failed AI/network generation has produced new items.
      const { data, error } = await (supabase as any).rpc(
        'replace_household_shopping_list',
        {
          p_household_id: currentHousehold.id,
          p_created_by: user.id,
          p_week_key: weekKey,
          p_items: itemsToInsert,
        }
      );

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        quantityDisplay: item.quantity_display,
        unit: item.unit,
        consolidatedQuantity: item.consolidated_quantity,
        consolidatedUnit: item.consolidated_unit,
        sourceIngredients: item.source_ingredients || [],
        isChecked: item.is_checked,
        isCustom: item.is_custom,
        recipeIds: item.recipe_ids || [],
        createdAt: item.created_at,
        createdBy: item.created_by,
        category: item.category
      }));
    } catch (error) {
      console.error('Error in shopping list generation:', error);
      return [];
    }
  }, [recipes, getMealPlansForWeek, user, currentHousehold]);

  return { generateAndSaveFromMealPlans };
};
