
import { useCallback } from "react";
import { ShoppingListCategory, SHOPPING_CATEGORIES } from "@/types/shoppingList";
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

  const categorizeWithAI = async (ingredient: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('categorize-ingredient', {
        body: { ingredient }
      });

      if (error) throw error;
      
      return data.category || 'Food Cupboard';
    } catch (error) {
      console.error('Error categorizing ingredient:', error);
      return 'Food Cupboard'; // Fallback
    }
  };

  const generateAndSaveFromMealPlans = useCallback(async (weekNumber: 1 | 2): Promise<ShoppingListCategory> => {
    if (!recipes.length || !user || !currentHousehold) {
      console.log('Missing requirements for generation');
      return {};
    }

    const mealPlans = getMealPlansForWeek(weekNumber);
    if (!mealPlans.length) {
      console.log('No meal plans for week', weekNumber);
      return {};
    }

    console.log('Generating shopping list from meal plans:', mealPlans.length);

    const ingredientMap = new Map<string, {
      quantity: number;
      unit: string;
      recipeIds: string[];
    }>();

    // Collect ingredients from meal plans
    mealPlans.forEach(mealPlan => {
      if (mealPlan.isLeftover) return;
      
      const recipe = recipes.find(r => r.id === mealPlan.recipeId);
      if (!recipe) return;

      recipe.ingredients.forEach(ingredient => {
        const normalizedName = ingredient.toLowerCase().trim();
        
        if (ingredientMap.has(normalizedName)) {
          const existing = ingredientMap.get(normalizedName)!;
          if (!existing.recipeIds.includes(recipe.id)) {
            existing.recipeIds.push(recipe.id);
          }
        } else {
          ingredientMap.set(normalizedName, {
            quantity: 1,
            unit: '',
            recipeIds: [recipe.id]
          });
        }
      });
    });

    console.log('Found ingredients:', ingredientMap.size);

    // Save ingredients to database with AI categorization
    const categorizedItems: ShoppingListCategory = {};
    SHOPPING_CATEGORIES.forEach(cat => {
      categorizedItems[cat] = [];
    });

    // Process ingredients in batches to avoid overwhelming the API
    const ingredients = Array.from(ingredientMap.entries());
    const batchSize = 5;
    
    for (let i = 0; i < ingredients.length; i += batchSize) {
      const batch = ingredients.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async ([name, details]) => {
        try {
          const category = await categorizeWithAI(name);
          
          // Save to database
          const newItem = await ShoppingListService.addCustomItem(
            name, 
            category, 
            currentHousehold.id, 
            user.id,
            details.recipeIds
          );
          
          if (newItem && categorizedItems[category]) {
            categorizedItems[category].push(newItem);
          }
        } catch (error) {
          console.error('Error processing ingredient:', name, error);
        }
      }));
    }

    console.log('Generated shopping list with categories:', Object.keys(categorizedItems).map(cat => `${cat}: ${categorizedItems[cat].length}`));
    return categorizedItems;
  }, [recipes, getMealPlansForWeek, user, currentHousehold]);

  return { generateAndSaveFromMealPlans };
};
