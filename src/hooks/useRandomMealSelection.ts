import { useState } from "react";
import { Recipe, MealType } from "@/types";
import { mealPlanService } from "@/services/mealPlanService";
import { useHousehold } from "@/contexts/HouseholdContext";
import { supabase } from "@/integrations/supabase/client";
import { parseISOWeekKey, getWeekStartDate, formatLocalDateYMD } from "@/utils/weekUtils";

export function useRandomMealSelection() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { currentHousehold } = useHousehold();

  const generateRandomMeals = async (
    weekKey: string,
    mealType: MealType | "all",
    numMeals: number,
    onProgress?: (progress: number) => void
  ) => {
    if (!currentHousehold) {
      throw new Error("No household selected");
    }

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Fetch all recipes for the household
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('household_id', currentHousehold.id);

      if (error) throw error;

      // Filter recipes by meal type if specified
      let filteredRecipes = recipes || [];
      if (mealType !== 'all') {
        filteredRecipes = filteredRecipes.filter(recipe => 
          (recipe.meal_types && recipe.meal_types.includes(mealType)) || recipe.meal_type === mealType
        );
      }

      if (filteredRecipes.length === 0) {
        throw new Error(`No ${mealType === 'all' ? '' : mealType + ' '}recipes found`);
      }

      // Randomly select recipes
      const selectedRecipes = [];
      const recipesToChooseFrom = [...filteredRecipes];
      
      for (let i = 0; i < Math.min(numMeals, recipesToChooseFrom.length); i++) {
        const randomIndex = Math.floor(Math.random() * recipesToChooseFrom.length);
        selectedRecipes.push(recipesToChooseFrom.splice(randomIndex, 1)[0]);
        
        if (onProgress) {
          onProgress((i + 1) / numMeals * 50); // First 50% for selection
        }
      }

      // Calculate a date within the target week (Monday of that week)
      const { year, week } = parseISOWeekKey(weekKey);
      const weekStartDate = getWeekStartDate(year, week);
      const dateStr = formatLocalDateYMD(weekStartDate);

      // Add selected recipes to meal plan
      const addPromises = selectedRecipes.map(async (recipe, index) => {
        const mealPlanData = {
          recipe_id: recipe.id,
          meal_type: mealType === 'all' ? 'dinner' : mealType,
          date: dateStr,
          created_by: user.id,
          slot_index: index,
          is_leftover: false,
          household_id: currentHousehold.id,
          week_key: weekKey,
          original_servings: recipe.servings || 4,
          planned_servings: recipe.servings || 4, // Add planned_servings field
          is_completed: false, // Add the required is_completed field
          is_freetyped: false, // Not a freetyped meal
        };

        await mealPlanService.addMealPlan(
          mealPlanData,
          weekKey,
          currentHousehold.id,
          user.id,
          true // Silent mode
        );

        if (onProgress) {
          const progressValue = 50 + ((index + 1) / selectedRecipes.length * 50);
          onProgress(progressValue);
        }
      });

      await Promise.all(addPromises);
      
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
