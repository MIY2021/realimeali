
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

    try {
      // Call OpenAI consolidation function
      const { data, error } = await supabase.functions.invoke('consolidate-ingredients', {
        body: { ingredients: ingredientInputs }
      });

      if (error) throw error;

      const consolidatedIngredients = data.consolidatedIngredients;
      console.log('Received consolidated ingredients:', consolidatedIngredients.length);

      // Save consolidated ingredients to database
      const savedItems: ShoppingListItem[] = [];
      
      for (const item of consolidatedIngredients) {
        const savedItem = await ShoppingListService.addConsolidatedItem(
          item.name,
          item.consolidatedQuantity,
          item.consolidatedUnit,
          item.sourceIngredients,
          item.recipeIds,
          currentHousehold.id,
          user.id,
          weekNumber
        );
        
        if (savedItem) {
          savedItems.push(savedItem);
        }
      }

      console.log('Generated consolidated shopping list for week', weekNumber, 'with', savedItems.length, 'items');
      return savedItems;
    } catch (error) {
      console.error('Error consolidating ingredients:', error);
      return [];
    }
  }, [recipes, getMealPlansForWeek, user, currentHousehold]);

  return { generateAndSaveFromMealPlans };
};
