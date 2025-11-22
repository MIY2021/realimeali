import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { MealPlan } from "@/types";
import { mealPlanService } from "@/services/mealPlanService";

export const useMealPlanOperations = (
  user: any,
  currentHousehold: any,
  recipes: any[],
  setMealPlans: any,
  mealPlans: any[]
) => {
  const { toast } = useToast();

  const addMealPlan = useCallback(async (
    mealPlanData: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>, 
    weekNumber: 1 | 2,
    silentMode = false
  ) => {
    if (!user || !currentHousehold) {
      throw new Error('User must be logged in and have a household');
    }

    try {
      // Get the recipe to determine default servings if not provided
      const recipe = recipes.find(r => r.id === mealPlanData.recipe_id);
      const defaultServings = recipe?.servings || 1;

      // Ensure planned_servings is set (use original_servings or recipe servings as fallback)
      const dataWithServings = {
        ...mealPlanData,
        planned_servings: mealPlanData.planned_servings || mealPlanData.original_servings || defaultServings
      };

      const newMealPlan = await mealPlanService.addMealPlan(
        dataWithServings,
        weekNumber,
        currentHousehold.id,
        user.id,
        silentMode
      );

      setMealPlans((prev: MealPlan[]) => [...prev, newMealPlan]);

      // Dispatch achievement check events
      window.dispatchEvent(new CustomEvent('checkMealPlanningAchievements'));
      if (mealPlanData.is_leftover) {
        window.dispatchEvent(new CustomEvent('checkLeftoverAchievements'));
        window.dispatchEvent(new CustomEvent('checkSustainabilityAchievements'));
      }
      if (mealPlanData.is_freetyped) {
        // Freestyle meal achievement would go here if it existed
      }

      if (!silentMode) {
        toast({
          title: "Meal Added",
          description: `${recipe?.title || 'Meal'} added to ${mealPlanData.meal_type}`,
        });
      }
    } catch (error) {
      console.error("Error adding meal plan:", error);
      if (!silentMode) {
        toast({
          title: "Error",
          description: "Failed to add meal plan. Please try again.",
          variant: "destructive",
        });
      }
      throw error;
    }
  }, [user?.id, currentHousehold?.id, recipes, setMealPlans, toast]);

  const removeMealPlan = useCallback(async (id: string) => {
    if (!user || !currentHousehold) {
      throw new Error('User must be logged in and have a household');
    }

    try {
      await mealPlanService.removeMealPlan(id, currentHousehold.id);
      setMealPlans((prev: MealPlan[]) => prev.filter(plan => plan.id !== id));
    } catch (error) {
      console.error("Error removing meal plan:", error);
      toast({
        title: "Error",
        description: "Failed to remove meal plan. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [user?.id, currentHousehold?.id, setMealPlans, toast]);

  const clearWeek = useCallback(async (weekNumber: 1 | 2) => {
    if (!user || !currentHousehold) {
      throw new Error('User must be logged in and have a household');
    }

    try {
      await mealPlanService.clearWeek(weekNumber, currentHousehold.id);
      setMealPlans((prev: MealPlan[]) => prev.filter(plan => plan.week_number !== weekNumber));
      toast({
        title: "Week Cleared",
        description: `Week ${weekNumber} meal plans cleared.`,
      });
    } catch (error) {
      console.error("Error clearing week:", error);
      toast({
        title: "Error",
        description: "Failed to clear week. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [user?.id, currentHousehold?.id, setMealPlans, toast]);

  return {
    addMealPlan,
    removeMealPlan,
    clearWeek,
  };
};
