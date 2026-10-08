import { useState } from "react";
import { Recipe, MealType } from "@/types";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { parseISOWeekKey, getWeekStartDate, formatLocalDateYMD } from "@/utils/weekUtils";

export function useRandomMealSelection() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { addMealPlan } = useMealPlan();
  const { recipes } = useRecipes();

  const generateRandomMeals = async (
    weekKey: string,
    mealType: MealType | "all",
    numMeals: number,
    onProgress?: (progress: number) => void
  ) => {
    setIsGenerating(true);

    try {
      // Use the recipes already loaded by RecipesContext. This keeps generation
      // consistent with the recipes shown in the Add Meal sheet and avoids a
      // second direct database query with different auth/RLS behaviour.
      let filteredRecipes = recipes || [];

      if (mealType !== "all") {
        filteredRecipes = filteredRecipes.filter(recipe =>
          (recipe.meal_types && recipe.meal_types.includes(mealType)) ||
          recipe.meal_type === mealType
        );
      }

      if (filteredRecipes.length === 0) {
        throw new Error(
          `No ${mealType === "all" ? "" : mealType + " "}recipes found`
        );
      }

      const selectedRecipes: Recipe[] = [];
      const recipesToChooseFrom = [...filteredRecipes];

      for (let i = 0; i < Math.min(numMeals, recipesToChooseFrom.length); i++) {
        const randomIndex = Math.floor(Math.random() * recipesToChooseFrom.length);
        selectedRecipes.push(recipesToChooseFrom.splice(randomIndex, 1)[0]);

        if (onProgress) {
          onProgress(((i + 1) / numMeals) * 50);
        }
      }

      const { year, week } = parseISOWeekKey(weekKey);
      const weekStartDate = getWeekStartDate(year, week);
      const dateStr = formatLocalDateYMD(weekStartDate);

      for (let index = 0; index < selectedRecipes.length; index++) {
        const recipe = selectedRecipes[index];

        await addMealPlan(
          {
            recipe_id: recipe.id,
            meal_type: mealType === "all" ? "dinner" : mealType,
            date: dateStr,
            created_by: recipe.created_by,
            slot_index: index,
            is_leftover: false,
            household_id: recipe.household_id,
            week_key: weekKey,
            original_servings: recipe.servings || 4,
            planned_servings: recipe.servings || 4,
            is_completed: false,
            is_freetyped: false,
          },
          weekKey,
          true
        );

        if (onProgress) {
          onProgress(50 + ((index + 1) / selectedRecipes.length) * 50);
        }
      }

      return selectedRecipes.length;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateRandomMeals,
    isGenerating,
  };
}
