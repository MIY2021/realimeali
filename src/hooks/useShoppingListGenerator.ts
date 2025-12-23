
import { useCallback } from "react";
import { ShoppingListItem } from "@/types/shoppingList";
import { useRecipes } from "@/contexts/RecipesContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { ShoppingListService } from "@/services/shoppingListService";
import { getCategoryForIngredient } from "@/services/ingredientCategorizationService";
import { DEFAULT_INGREDIENT_CATEGORY } from "@/types/ingredientCategories";

// Helper function to detect ingredient group headers (same as EnhancedIngredientManager)
const isHeader = (ingredient: string) => {
  return ingredient.trim().endsWith(':') && !ingredient.match(/\d+.*:/);
};

export const useShoppingListGenerator = () => {
  const { recipes } = useRecipes();
  const { getMealPlansForWeek } = useMealPlan();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();

  const generateAndSaveFromMealPlans = useCallback(async (weekKey: string): Promise<ShoppingListItem[]> => {
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

      // Step 3: Look up categories and cleaned names for all ingredients
      console.log('Looking up categories and cleaned names for', ingredientItems.length, 'ingredients...');
      const categoryLookups = await Promise.allSettled(
        ingredientItems.map(async (item) => {
          const result = await getCategoryForIngredient(item.name);
          return { item, category: result.category, cleanedName: result.cleanedName };
        })
      );

      // Step 4: Save all items directly (no consolidation)
      const savedItems: ShoppingListItem[] = [];
      
      console.log('Saving', ingredientItems.length, 'items directly...');
      
      for (let i = 0; i < ingredientItems.length; i++) {
        const item = ingredientItems[i];
        const categoryResult = categoryLookups[i];
        
        // Get category and cleaned name from lookup result, default to "Other" if lookup failed
        let category = DEFAULT_INGREDIENT_CATEGORY;
        let cleanedName = item.name; // Default to original name if lookup failed
        if (categoryResult.status === 'fulfilled') {
          category = categoryResult.value.category;
          cleanedName = categoryResult.value.cleanedName || item.name;
        } else {
          console.warn('Failed to get category for ingredient:', item.name, categoryResult.reason);
        }

        // Filter out water even after cleaning (in case cleaned name is "Water")
        const lowerCleanedName = cleanedName.toLowerCase().trim();
        if (lowerCleanedName === 'water' || 
            lowerCleanedName === 'cold water' ||
            lowerCleanedName === 'hot water' ||
            lowerCleanedName === 'warm water' ||
            lowerCleanedName === 'boiling water' ||
            lowerCleanedName === 'room temperature water') {
          console.log('Skipping water (after cleaning):', cleanedName);
          continue;
        }

        try {
          // Save item with cleaned name (shopping list-ready format)
          const savedItem = await ShoppingListService.addConsolidatedItem(
            cleanedName, // Use cleaned name for shopping list display
            1, // Default quantity (not used for display)
            '', // No unit (not used for display)
            [item.name], // Source ingredients keeps the original text
            [item.recipeId], // Single recipe ID
            currentHousehold.id,
            user.id,
            weekKey,
            category
          );
          
          if (savedItem) {
            savedItems.push(savedItem);
          }
        } catch (itemError) {
          console.error('Error saving individual item:', item, itemError);
        }
      }

      console.log('Successfully saved', savedItems.length, 'items for week', weekKey);
      return savedItems;
      
    } catch (error) {
      console.error('Error in shopping list generation:', error);
      return [];
    }
  }, [recipes, getMealPlansForWeek, user, currentHousehold]);

  return { generateAndSaveFromMealPlans };
};
