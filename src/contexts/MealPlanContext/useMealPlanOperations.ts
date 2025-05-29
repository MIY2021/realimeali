
import { useCallback } from "react";
import { MealType, MealPlan } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { mealPlanService } from "@/services/mealPlanService";

export const useMealPlanOperations = (
  user: any,
  currentHousehold: any,
  recipes: any[],
  setMealPlans: (updater: (prev: MealPlan[]) => MealPlan[]) => void,
  mealPlans: MealPlan[]
) => {
  const { toast } = useToast();

  const addMealPlan = useCallback(async (
    mealPlanData: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>, 
    weekNumber: 1 | 2, 
    silentMode = false
  ) => {
    if (!user || !currentHousehold) {
      if (!silentMode) {
        console.error("User or household not available");
        toast({
          title: "Error", 
          description: "You must be logged in and have a current household to add meal plans.",
          variant: "destructive",
        });
      }
      return;
    }

    const recipeExists = recipes.some(recipe => recipe.id === mealPlanData.recipe_id);
    if (!recipeExists) {
      if (!silentMode) {
        console.error("Recipe not found in collection:", mealPlanData.recipe_id);
        toast({
          title: "Error",
          description: "Recipe not found in your collection.",
          variant: "destructive",
        });
      }
      return;
    }

    try {
      if (!silentMode) {
        console.log("Adding meal plan:", { mealPlanData, weekNumber, userId: user.id, householdId: currentHousehold.id });
      }
      
      // Ensure weekNumber is included in the meal plan data
      const mealPlanWithWeek = {
        ...mealPlanData,
        week_number: weekNumber
      };
      
      const newMealPlan = await mealPlanService.addMealPlan(
        mealPlanWithWeek, 
        weekNumber, 
        currentHousehold.id, 
        user.id,
        silentMode
      );

      setMealPlans(prev => [...prev, newMealPlan]);
      
      if (!silentMode) {
        const recipe = recipes.find(r => r.id === mealPlanData.recipe_id);
        toast({
          title: "Recipe Added",
          description: `${recipe?.title || 'Recipe'} has been added to your meal plan for Week ${weekNumber}.`,
        });
      }
    } catch (err) {
      console.error("Error adding meal plan:", err);
      if (!silentMode) {
        toast({
          title: "Error",
          description: "Failed to add meal plan. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [user?.id, currentHousehold?.id, recipes, setMealPlans, toast]);

  const removeMealPlan = useCallback(async (id: string) => {
    if (!user || !currentHousehold) return;

    try {
      const childLeftovers = mealPlans.filter(plan => plan.parent_meal_plan_id === id);
      
      if (childLeftovers.length > 0) {
        const shouldRemoveLeftovers = window.confirm(
          "This meal has leftover portions planned. Remove leftovers too?"
        );
        
        if (shouldRemoveLeftovers) {
          for (const leftover of childLeftovers) {
            await mealPlanService.removeMealPlan(leftover.id, currentHousehold.id);
          }
        }
      }
      
      await mealPlanService.removeMealPlan(id, currentHousehold.id);

      setMealPlans(prev => prev.filter(plan => 
        plan.id !== id && plan.parent_meal_plan_id !== id
      ));
      
      toast({
        title: "Recipe Removed",
        description: "Recipe has been removed from your meal plan.",
      });
    } catch (err) {
      console.error("Error removing meal plan:", err);
      toast({
        title: "Error",
        description: "Failed to remove meal plan. Please try again.",
        variant: "destructive",
      });
    }
  }, [user?.id, currentHousehold?.id, mealPlans, setMealPlans, toast]);

  const clearWeek = useCallback(async (weekNumber: 1 | 2) => {
    if (!user || !currentHousehold) return;

    try {
      await mealPlanService.clearWeek(weekNumber, currentHousehold.id);
      setMealPlans(prev => prev.filter(plan => plan.week_number !== weekNumber));
      
      toast({
        title: "Week Cleared",
        description: `Week ${weekNumber} meal plan has been cleared.`,
      });
    } catch (err) {
      console.error("Error clearing week:", err);
      toast({
        title: "Error",
        description: "Failed to clear week. Please try again.",
        variant: "destructive",
      });
    }
  }, [user?.id, currentHousehold?.id, setMealPlans, toast]);

  return {
    addMealPlan,
    removeMealPlan,
    clearWeek,
  };
};
