
import { useState } from "react";
import { Recipe, MealPlanMealType } from "@/types";
import { useRecipes } from "@/contexts/RecipesContext";

interface MealQuantities {
  dinner: number;
  lunch: number;
  breakfast: number;
  snacks: number;
}

export function useRandomMealSelection() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { recipes } = useRecipes();

  const generateRandomMealPlan = async (quantities: MealQuantities) => {
    setIsGenerating(true);
    
    try {
      const selectedMeals: Array<{
        recipe: Recipe;
        mealType: MealPlanMealType;
        date: string;
      }> = [];

      // For now, just randomly select recipes for each meal type
      const mealTypes: MealPlanMealType[] = ["breakfast", "lunch", "dinner", "snacks"];
      
      mealTypes.forEach(mealType => {
        const count = quantities[mealType];
        const availableRecipes = recipes.filter(recipe => 
          recipe.meal_type === mealType || !recipe.meal_type
        );
        
        for (let i = 0; i < count; i++) {
          if (availableRecipes.length > 0) {
            const randomRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
            selectedMeals.push({
              recipe: randomRecipe,
              mealType,
              date: new Date().toISOString().split('T')[0] // Today's date for now
            });
          }
        }
      });

      return selectedMeals;
    } catch (error) {
      console.error("Error generating meal plan:", error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateRandomMealPlan,
    isGenerating
  };
}
