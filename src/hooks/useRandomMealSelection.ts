import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useToast } from "@/hooks/use-toast";
import { MealType } from "@/types";

interface UseRandomMealSelectionProps {
  weekNumber: 1 | 2;
}

export const useRandomMealSelection = ({ weekNumber }: UseRandomMealSelectionProps) => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { recipes } = useRecipes();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRandomDate = useCallback(() => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + Math.floor(Math.random() * 7)); // Random day within the next 7 days
    return futureDate.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
  }, []);

  const getRandomRecipe = useCallback((mealType: MealType) => {
    const availableRecipes = recipes.filter(recipe => recipe.meal_type === mealType);
    if (availableRecipes.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * availableRecipes.length);
    return availableRecipes[randomIndex];
  }, [recipes]);

  const addRandomMeal = useCallback(async (mealType: MealType) => {
    if (!user || !currentHousehold) {
      toast({
        title: "Error",
        description: "Please log in and select a household",
        variant: "destructive",
      });
      return null;
    }

    if (recipes.length === 0) {
      toast({
        title: "No recipes",
        description: "No recipes found. Please add some recipes first.",
        variant: "destructive",
      });
      return null;
    }

    const selectedRecipe = getRandomRecipe(mealType);
    if (!selectedRecipe) {
      toast({
        title: "No recipes for meal type",
        description: `No recipes found for ${mealType}. Please add some recipes first.`,
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsGenerating(true);

      const mealPlan = {
        recipe_id: selectedRecipe.id,
        meal_type: mealType,
        date: generateRandomDate(),
        created_by: user.id,
        slot_index: 0,
        is_leftover: false,
        household_id: currentHousehold.id,
        week_number: weekNumber,
        original_servings: selectedRecipe.servings,
        planned_servings: selectedRecipe.servings,
        is_completed: false,
        is_freetyped: false,
      };

      toast({
        title: "Meal added",
        description: `${selectedRecipe.title} has been added to ${mealType}`,
      });

      return mealPlan;
    } catch (error) {
      console.error("Error adding meal plan:", error);
      toast({
        title: "Error",
        description: "Failed to add meal plan. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [user, currentHousehold, recipes, getRandomRecipe, generateRandomDate, weekNumber, toast]);

  return { addRandomMeal, isGenerating };
};
