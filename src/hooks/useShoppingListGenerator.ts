
import { useCallback } from "react";
import { ShoppingListItem } from "@/types/shoppingList";
import { useRecipes } from "@/contexts/RecipesContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingListService } from "@/services/shoppingListService";

export const useShoppingListGenerator = () => {
  const { recipes } = useRecipes();
  const { getMealPlansForWeek } = useMealPlan();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();

  const generateAndSaveFromMealPlans = useCallback(async (weekNumber: 1 | 2): Promise<ShoppingListItem[]> => {
    if (!recipes.length || !user || !currentHousehold) {
      console.log('Missing requirements for generation');
      return [];
    }

    const mealPlans = getMealPlansForWeek(weekNumber);
    if (!mealPlans.length) {
      console.log('No meal plans for week', weekNumber);
      return [];
    }

    console.log('Generating consolidated shopping list from meal plans for week', weekNumber, ':', mealPlans.length);

    // Clear existing items for this week first to prevent duplicates
    await ShoppingListService.clearAll(currentHousehold.id, weekNumber);

    // Collect ingredients from meal plans
    const ingredientInputs: Array<{
      name: string;
      recipeId: string;
      recipeTitle: string;
    }> = [];

    mealPlans.forEach(mealPlan => {
      if (mealPlan.isLeftover) return;
      
      const recipe = recipes.find(r => r.id === mealPlan.recipeId);
      if (!recipe) return;

      recipe.ingredients.forEach(ingredient => {
        ingredientInputs.push({
          name: ingredient,
          recipeId: recipe.id,
          recipeTitle: recipe.title
        });
      });
    });

    console.log('Found ingredients for consolidation:', ingredientInputs.length);

    if (ingredientInputs.length === 0) {
      console.log('No ingredients found to consolidate');
      return [];
    }

    try {
      // Call OpenAI consolidation function
      const { data, error } = await supabase.functions.invoke('consolidate-ingredients', {
        body: { ingredients: ingredientInputs }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data || !data.consolidatedIngredients) {
        console.error('No consolidated ingredients returned from function');
        return [];
      }

      const consolidatedIngredients = data.consolidatedIngredients;
      console.log('Received consolidated ingredients:', consolidatedIngredients.length);

      // Save consolidated ingredients to database
      const savedItems: ShoppingListItem[] = [];
      
      for (const item of consolidatedIngredients) {
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
      
      // Fallback: save individual ingredients if consolidation fails completely
      console.log('Falling back to individual ingredient saving');
      const fallbackItems: ShoppingListItem[] = [];
      
      for (const ingredient of ingredientInputs) {
        try {
          const savedItem = await ShoppingListService.addCustomItem(
            ingredient.name,
            currentHousehold.id,
            user.id,
            weekNumber,
            [ingredient.recipeId]
          );
          
          if (savedItem) {
            fallbackItems.push(savedItem);
          }
        } catch (itemError) {
          console.error('Error saving fallback item:', ingredient, itemError);
        }
      }
      
      return fallbackItems;
    }
  }, [recipes, getMealPlansForWeek, user, currentHousehold]);

  return { generateAndSaveFromMealPlans };
};
