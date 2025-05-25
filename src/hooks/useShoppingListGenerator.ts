
import { useCallback } from "react";
import { ShoppingListCategory, SHOPPING_CATEGORIES } from "@/types/shoppingList";
import { categorizeIngredient } from "@/utils/ingredientCategorizer";
import { useRecipes } from "@/contexts/RecipesContext";
import { useMealPlan } from "@/contexts/MealPlanContext";

export const useShoppingListGenerator = () => {
  const { recipes } = useRecipes();
  const { getMealPlansForWeek } = useMealPlan();

  const generateFromMealPlans = useCallback((weekNumber: 1 | 2): ShoppingListCategory => {
    if (!recipes.length) return {};

    const mealPlans = getMealPlansForWeek(weekNumber);
    if (!mealPlans.length) return {};

    const ingredientMap = new Map<string, {
      quantity: number;
      unit: string;
      category: string;
      recipeIds: string[];
    }>();

    mealPlans.forEach(mealPlan => {
      if (mealPlan.isLeftover) return;
      
      const recipe = recipes.find(r => r.id === mealPlan.recipeId);
      if (!recipe) return;

      recipe.ingredients.forEach(ingredient => {
        const normalizedName = ingredient.toLowerCase().trim();
        const category = categorizeIngredient(ingredient);
        
        if (ingredientMap.has(normalizedName)) {
          const existing = ingredientMap.get(normalizedName)!;
          existing.recipeIds.push(recipe.id);
        } else {
          ingredientMap.set(normalizedName, {
            quantity: 1,
            unit: '',
            category,
            recipeIds: [recipe.id]
          });
        }
      });
    });

    const categorizedItems: ShoppingListCategory = {};
    SHOPPING_CATEGORIES.forEach(cat => {
      categorizedItems[cat] = [];
    });

    for (const [name, details] of ingredientMap) {
      categorizedItems[details.category].push({
        id: `generated-${name}`,
        name,
        quantity: details.quantity,
        unit: details.unit,
        category: details.category,
        isChecked: false,
        isCustom: false,
        recipeIds: details.recipeIds
      });
    }

    return categorizedItems;
  }, [recipes, getMealPlansForWeek]);

  return { generateFromMealPlans };
};
