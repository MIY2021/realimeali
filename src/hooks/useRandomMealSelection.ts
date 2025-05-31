
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

      // Generate meals for the 4 main types only (skip sides, desserts, drinks)
      const mealTypesToGenerate: Array<{ type: MealPlanMealType; count: number }> = [
        { type: "dinner", count: quantities.dinner },
        { type: "lunch", count: quantities.lunch },
        { type: "breakfast", count: quantities.breakfast },
        { type: "snacks", count: quantities.snacks }
      ];
      
      mealTypesToGenerate.forEach(({ type, count }) => {
        const availableRecipes = recipes.filter(recipe => 
          recipe.meal_type === type || (!recipe.meal_type && type === "dinner")
        );
        
        for (let i = 0; i < count; i++) {
          if (availableRecipes.length > 0) {
            const randomRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
            selectedMeals.push({
              recipe: randomRecipe,
              mealType: type,
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
