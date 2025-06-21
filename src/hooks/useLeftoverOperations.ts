
import { useCallback } from "react";
import { Recipe } from "@/types";
import { mealPlanService } from "@/services/mealPlanService";

interface UseLeftoverOperationsProps {
  user: any;
  currentHousehold: any;
  currentWeek: 1 | 2;
  addMealPlan: any;
  toast: any;
  refreshMealPlans?: () => void;
}

export const useLeftoverOperations = ({
  user,
  currentHousehold,
  currentWeek,
  addMealPlan,
  toast,
  refreshMealPlans,
}: UseLeftoverOperationsProps) => {

  const handleCreateLeftover = useCallback(async (mealPlan: any, recipe: Recipe, leftoverServings?: number) => {
    if (!user || !currentHousehold) {
      console.error("No user or household available for leftover creation");
      toast({
        title: "Error",
        description: "Please log in and select a household",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Creating leftover with data:", { 
        mealPlan: mealPlan.id, 
        recipe: recipe.title, 
        leftoverServings, 
        currentWeek,
        userId: user.id,
        householdId: currentHousehold.id
      });

      // Ensure we have a positive integer servings value
      let servingsToSave: number;
      if (leftoverServings && Number.isInteger(leftoverServings) && leftoverServings > 0) {
        servingsToSave = leftoverServings;
      } else {
        servingsToSave = Math.max(1, Math.floor((mealPlan.planned_servings || recipe.servings) / 2));
      }
      
      console.log("✅ Calculated servings to save:", servingsToSave);
      
      // Update the original dinner meal servings first (reduce by leftover amount)
      const originalServings = mealPlan.planned_servings || recipe.servings;
      const remainingServings = originalServings - servingsToSave;
      
      console.log("✅ Updating original meal plan servings:", { originalServings, remainingServings, servingsToSave });
      
      // Update the dinner meal to reflect reduced servings
      await mealPlanService.updateMealPlanServings(
        mealPlan.id,
        remainingServings,
        currentHousehold.id
      );
      console.log("✅ Original meal plan servings updated successfully");

      // Create the leftover meal with the allocated servings
      const leftoverData = {
        recipe_id: mealPlan.recipe_id,
        meal_type: 'lunch' as any,
        date: mealPlan.date,
        created_by: user.id,
        slot_index: 0,
        is_leftover: true,
        leftover_servings: servingsToSave,
        planned_servings: servingsToSave, // Use planned_servings for the leftover meal
        original_servings: recipe.servings,
        parent_meal_plan_id: mealPlan.id,
        household_id: currentHousehold.id,
        week_number: currentWeek,
      };

      console.log("✅ Creating leftover meal with data:", leftoverData);

      await addMealPlan(leftoverData, currentWeek);
      console.log("✅ Leftover meal created successfully");

      // Refresh meal plans to ensure UI shows updated data
      if (refreshMealPlans) {
        console.log("✅ Refreshing meal plans to update UI");
        await refreshMealPlans();
      }
      
      toast({
        title: "Leftover Added",
        description: `${servingsToSave} servings of ${recipe.title} saved for lunch. Dinner now shows ${remainingServings} servings.`,
      });
    } catch (err) {
      console.error("💥 Error creating leftover:", err);
      toast({
        title: "Error",
        description: `Failed to create leftover meal: ${err?.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  }, [user, currentHousehold, currentWeek, addMealPlan, toast, refreshMealPlans]);

  return {
    handleCreateLeftover,
  };
};
