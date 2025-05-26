
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
    console.log('=== STARTING SHOPPING LIST GENERATION ===');
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
    console.log('Meal plans details:', mealPlans.map(mp => ({
      id: mp.id,
      recipeId: mp.recipeId,
      mealType: mp.mealType,
      isLeftover: mp.isLeftover
    })));

    if (!mealPlans.length) {
      console.log('No meal plans for week', weekNumber);
      return [];
    }

    // Clear existing items for this week first to prevent duplicates
    console.log('Clearing existing items for week', weekNumber);
    await ShoppingListService.clearAll(currentHousehold.id, weekNumber);

    // Collect ingredients from meal plans
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
        ingredientInputs.push({
          name: ingredient,
          recipeId: recipe.id,
          recipeTitle: recipe.title
        });
      });
    });

    console.log('Total ingredients collected:', ingredientInputs.length);
    console.log('Sample ingredients:', ingredientInputs.slice(0, 5));

    if (ingredientInputs.length === 0) {
      console.log('No ingredients found to consolidate');
      return [];
    }

    try {
      console.log('Calling consolidate-ingredients edge function...');
      
      // Call OpenAI consolidation function
      const { data, error } = await supabase.functions.invoke('consolidate-ingredients', {
        body: { ingredients: ingredientInputs }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (!data || !data.consolidatedIngredients) {
        console.error('No consolidated ingredients returned from function');
        throw new Error('No data returned from consolidation function');
      }

      const consolidatedIngredients = data.consolidatedIngredients;
      console.log('Received consolidated ingredients:', consolidatedIngredients.length);
      console.log('Sample consolidated:', consolidatedIngredients.slice(0, 3));

      // Save consolidated ingredients to database
      const savedItems: ShoppingListItem[] = [];
      
      for (const item of consolidatedIngredients) {
        try {
          console.log('Saving item:', {
            name: item.name,
            quantity: item.consolidatedQuantity,
            unit: item.consolidatedUnit,
            recipeIds: item.recipeIds
          });

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
            console.log('Successfully saved item:', savedItem.id);
            savedItems.push(savedItem);
          } else {
            console.error('Failed to save item:', item.name);
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
      
      for (const ingredient of ingredientInputs.slice(0, 10)) { // Limit fallback to prevent spam
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
      
      console.log('Fallback saved', fallbackItems.length, 'items');
      return fallbackItems;
    }
  }, [recipes, getMealPlansForWeek, user, currentHousehold]);

  return { generateAndSaveFromMealPlans };
};
