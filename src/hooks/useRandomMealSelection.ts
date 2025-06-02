
import { useState } from "react";
import { Recipe, MealPlanMealType } from "@/types";
import { mealPlanService } from "@/services/mealPlanService";
import { useHousehold } from "@/contexts/HouseholdContext";
import { supabase } from "@/integrations/supabase/client";

export function useRandomMealSelection() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { currentHousehold } = useHousehold();

  const generateRandomMeals = async (
    weekNumber: 1 | 2,
    mealType: MealPlanMealType,
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
        filteredRecipes = filteredRecipes.filter(recipe => recipe.meal_type === mealType);
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

      // Add selected recipes to meal plan
      const addPromises = selectedRecipes.map(async (recipe, index) => {
        const mealPlanData = {
          recipe_id: recipe.id,
          meal_type: mealType as MealPlanMealType,
          date: new Date().toISOString().split('T')[0], // Today's date as default
          created_by: user.id,
          slot_index: index,
          is_leftover: false,
          household_id: currentHousehold.id,
          week_number: weekNumber,
          original_servings: recipe.servings || 4,
        };

        await mealPlanService.addMealPlan(
          mealPlanData,
          weekNumber,
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
