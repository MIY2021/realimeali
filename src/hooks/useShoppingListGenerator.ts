
import { useCallback } from "react";
import { ShoppingListItem } from "@/types/shoppingList";
import { useRecipes } from "@/contexts/RecipesContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { ShoppingListService } from "@/services/shoppingListService";
import { IngredientConsolidationService } from "@/services/ingredientConsolidation";

export const useShoppingListGenerator = () => {
  const { recipes } = useRecipes();
  const { getMealPlansForWeek } = useMealPlan();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();

  const generateAndSaveFromMealPlans = useCallback(async (weekNumber: 1 | 2): Promise<ShoppingListItem[]> => {
    console.log('=== STARTING OPTIMIZED SHOPPING LIST GENERATION ===');
    console.log('Week:', weekNumber);
    console.log('User:', !!user);
    console.log('Household:', !!currentHousehold);
    console.log('Recipes count:', recipes.length);

    if (!recipes.length || !user || !currentHousehold) {
      console.log('Missing requirements for generation');
      return [];
    }

    const mealPlans = getMealPlansForWeek(weekNumber);
    console.log('Meal plans found:', mealPlans.length);

    if (!mealPlans.length) {
      console.log('No meal plans for week', weekNumber);
      return [];
    }

    try {
      // Step 1: Clear existing items for this week
      console.log('Clearing existing items for week', weekNumber);
      await ShoppingListService.clearAll(currentHousehold.id, weekNumber);

      // Step 2: Collect ingredients from meal plans
      const ingredientInputs: Array<{
        name: string;
        recipeId: string;
        recipeTitle: string;
      }> = [];

      mealPlans.forEach(mealPlan => {
        if (mealPlan.isLeftover) {
          console.log('Skipping leftover meal plan:', mealPlan.id);
          return;
        }
        
        const recipe = recipes.find(r => r.id === mealPlan.recipeId);
        if (!recipe) {
          console.log('Recipe not found for meal plan:', mealPlan.recipeId);
          return;
        }

        console.log('Processing recipe:', recipe.title, 'with', recipe.ingredients.length, 'ingredients');

        recipe.ingredients.forEach(ingredient => {
          // Filter out empty or invalid ingredients
          const trimmed = ingredient?.trim();
          if (trimmed && trimmed.length > 0 && trimmed !== 'undefined' && trimmed !== 'null') {
            ingredientInputs.push({
              name: trimmed,
              recipeId: recipe.id,
              recipeTitle: recipe.title
            });
          }
        });
      });

      console.log('Total valid ingredients collected:', ingredientInputs.length);

      if (ingredientInputs.length === 0) {
        console.log('No valid ingredients found to consolidate');
        return [];
      }

      // Step 3: Use fast local consolidation
      console.log('Starting fast local consolidation...');
      const startTime = performance.now();
      
      const consolidatedIngredients = IngredientConsolidationService.consolidateIngredients(ingredientInputs);
      
      const endTime = performance.now();
      console.log(`Consolidation completed in ${Math.round(endTime - startTime)}ms`);
      console.log('Consolidated ingredients:', consolidatedIngredients.length);

      // Step 4: Filter out invalid consolidated items
      const validConsolidatedIngredients = consolidatedIngredients.filter(item => {
        const isValid = item.name && 
                       item.name.trim().length > 0 && 
                       item.name !== 'undefined' && 
                       item.name !== 'null' &&
                       item.consolidatedQuantity > 0;
        
        if (!isValid) {
          console.log('Filtering out invalid item:', item);
        }
        
        return isValid;
      });

      console.log('Valid items after filtering:', validConsolidatedIngredients.length);

      // Step 5: Batch save all valid items to database
      const savedItems: ShoppingListItem[] = [];
      
      console.log('Batch saving', validConsolidatedIngredients.length, 'items...');
      
      for (const item of validConsolidatedIngredients) {
        try {
          const savedItem = await ShoppingListService.addConsolidatedItem(
            item.name,
            item.consolidatedQuantity || 1,
            item.consolidatedUnit || '',
            item.sourceIngredients || [item.name],
            item.recipeIds || [],
            currentHousehold.id,
            user.id,
            weekNumber
          );
          
          if (savedItem) {
            savedItems.push(savedItem);
          }
        } catch (itemError) {
          console.error('Error saving individual item:', item, itemError);
        }
      }

      console.log('Successfully saved', savedItems.length, 'consolidated items for week', weekNumber);
      return savedItems;
      
    } catch (error) {
      console.error('Error in consolidation process:', error);
      return [];
    }
  }, [recipes, getMealPlansForWeek, user, currentHousehold]);

  return { generateAndSaveFromMealPlans };
};
