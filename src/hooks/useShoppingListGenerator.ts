
import { useCallback } from "react";
import { ShoppingListItem } from "@/types/shoppingList";
import { useRecipes } from "@/contexts/RecipesContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { ShoppingListService } from "@/services/shoppingListService";
import { batchGetCategoriesFromDatabase } from "@/services/ingredientCategorizationService";
import { DEFAULT_INGREDIENT_CATEGORY } from "@/types/ingredientCategories";
import { supabase } from "@/integrations/supabase/client";

// Helper function to detect ingredient group headers (same as EnhancedIngredientManager)
const isHeader = (ingredient: string) => {
  return ingredient.trim().endsWith(':') && !ingredient.match(/\d+.*:/);
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
    checkedMap?: Map<string, boolean>
  ): Promise<ShoppingListItem[]> => {
    console.log('=== STARTING SHOPPING LIST GENERATION (NO CONSOLIDATION) ===');
    console.log('Week:', weekKey);
    console.log('User:', !!user);
    console.log('Household:', !!currentHousehold);
    console.log('Recipes count:', recipes.length);

    if (!recipes.length || !user || !currentHousehold) {
      console.log('Missing requirements for generation');
      return [];
    }

    const mealPlans = getMealPlansForWeek(weekKey);
    console.log('Meal plans found:', mealPlans.length);

    if (!mealPlans.length) {
      console.log('No meal plans for week', weekKey);
      return [];
    }

    try {
      // Step 1: Clear existing items for this week
      console.log('Clearing existing items for week', weekKey);
      await ShoppingListService.clearAll(currentHousehold.id, weekKey);

      // Step 2: Collect all ingredients from meal plans (no consolidation)
      const ingredientItems: Array<{
        name: string;
        recipeId: string;
        recipeTitle: string;
      }> = [];

      mealPlans.forEach(mealPlan => {
        if (mealPlan.is_leftover) {
          console.log('Skipping leftover meal plan:', mealPlan.id);
          return;
        }
        
        // Handle freetyped meals
        if (mealPlan.is_freetyped && mealPlan.meal_name) {
          console.log('Processing freetyped meal:', mealPlan.meal_name);
          ingredientItems.push({
            name: `Everything for ${mealPlan.meal_name}`,
            recipeId: mealPlan.id,
            recipeTitle: mealPlan.meal_name
          });
          return;
        }
        
        const recipe = recipes.find(r => r.id === mealPlan.recipe_id);
        if (!recipe) {
          console.log('Recipe not found for meal plan:', mealPlan.recipe_id);
          return;
        }

        console.log('Processing recipe:', recipe.title, 'with', recipe.ingredients.length, 'ingredients');

        recipe.ingredients.forEach(ingredient => {
          // Filter out empty, invalid ingredients, and section headers
          const trimmed = ingredient?.trim();
          if (trimmed && 
              trimmed.length > 0 && 
              trimmed !== 'undefined' && 
              trimmed !== 'null' && 
              !isHeader(trimmed)) {
            
            // Filter out "water" - it's a given people will use tap water
            const lowerTrimmed = trimmed.toLowerCase();
            if (lowerTrimmed === 'water' || 
                lowerTrimmed === 'water,' ||
                lowerTrimmed.startsWith('water ') ||
                lowerTrimmed === 'cold water' ||
                lowerTrimmed === 'hot water' ||
                lowerTrimmed === 'warm water' ||
                lowerTrimmed === 'boiling water' ||
                lowerTrimmed === 'room temperature water') {
              console.log('Skipping water:', trimmed);
              return;
            }
            
            ingredientItems.push({
              name: trimmed, // Use ingredient text exactly as-is
              recipeId: recipe.id,
              recipeTitle: recipe.title
            });
          }
        });
      });

      console.log('Total ingredients to save:', ingredientItems.length);

      if (ingredientItems.length === 0) {
        console.log('No valid ingredients found');
        return [];
      }

      // Step 3: Batch lookup categories from database (instant - no AI calls)
      console.log('Batch looking up categories for', ingredientItems.length, 'ingredients...');
      const uniqueIngredientNames = [...new Set(ingredientItems.map(item => item.name))];
      const categoryMap = await batchGetCategoriesFromDatabase(uniqueIngredientNames);

      // Step 4: Prepare items for batch insert
      const itemsToInsert = ingredientItems
        .filter(item => {
          // Filter out water
          const lowerTrimmed = item.name.toLowerCase().trim();
          return !(lowerTrimmed === 'water' || 
                   lowerTrimmed === 'water,' ||
                   lowerTrimmed.startsWith('water ') ||
                   lowerTrimmed === 'cold water' ||
                   lowerTrimmed === 'hot water' ||
                   lowerTrimmed === 'warm water' ||
                   lowerTrimmed === 'boiling water' ||
                   lowerTrimmed === 'room temperature water');
        })
        .map(item => {
          const normalizedKey = item.name.toLowerCase().trim();
          const categoryData = categoryMap.get(normalizedKey);
          
          // Filter out water even after cleaning (in case cleaned name is "Water")
          const cleanedName = categoryData?.cleanedName || item.name.trim();
          const lowerCleanedName = cleanedName.toLowerCase().trim();
          if (lowerCleanedName === 'water' || 
              lowerCleanedName === 'cold water' ||
              lowerCleanedName === 'hot water' ||
              lowerCleanedName === 'warm water' ||
              lowerCleanedName === 'boiling water' ||
              lowerCleanedName === 'room temperature water') {
            return null; // Will be filtered out
          }
          
          const checkedKey = buildCheckedKey(cleanedName, item.recipeId);
          const isChecked = checkedMap?.get(checkedKey) ?? false;

          return {
            household_id: currentHousehold.id,
            created_by: user.id,
            name: cleanedName, // Use cleaned name if available, otherwise original
            week_key: weekKey,
            is_custom: false,
            is_checked: isChecked,
            recipe_ids: [item.recipeId],
            consolidated_quantity: 1,
            consolidated_unit: '',
            source_ingredients: [item.name],
            category: categoryData?.category || DEFAULT_INGREDIENT_CATEGORY
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      // Step 5: Single batch insert instead of individual inserts
      if (itemsToInsert.length === 0) {
        console.log('No items to insert after filtering');
        return [];
      }

      console.log('Batch inserting', itemsToInsert.length, 'items...');
      const { data, error } = await supabase
        .from('household_shopping_lists')
        .insert(itemsToInsert)
        .select('id, name, quantity, unit, consolidated_quantity, consolidated_unit, source_ingredients, is_checked, is_custom, recipe_ids, created_at, created_by, category');

      if (error) {
        console.error('Error batch inserting shopping list items:', error);
        throw error;
      }

      const savedItems: ShoppingListItem[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
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

      console.log('Successfully saved', savedItems.length, 'items for week', weekKey);
      return savedItems;
      
    } catch (error) {
      console.error('Error in shopping list generation:', error);
      return [];
    }
  }, [recipes, getMealPlansForWeek, user, currentHousehold]);

  return { generateAndSaveFromMealPlans };
};
