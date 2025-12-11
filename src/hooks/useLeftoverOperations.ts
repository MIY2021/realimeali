
import { useCallback } from "react";
import { Recipe } from "@/types";
import { mealPlanService } from "@/services/mealPlanService";

interface UseLeftoverOperationsProps {
  user: any;
  currentHousehold: any;
  currentWeek: string; // ISO week key
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

  const handleCreateLeftover = useCallback(async (mealPlan: any, recipe?: Recipe, leftoverServings?: number) => {
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
      const mealName = recipe?.title || mealPlan.meal_name || 'Custom Meal';
      console.log("Creating leftover with data:", { 
        mealPlan: mealPlan.id, 
        mealName, 
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
        const baseServings = mealPlan.planned_servings || recipe?.servings || 2;
        servingsToSave = Math.max(1, Math.floor(baseServings / 2));
      }
      
      console.log("✅ Calculated servings to save:", servingsToSave);

      // Create the leftover meal with the allocated servings
      const leftoverData = {
        recipe_id: mealPlan.recipe_id || null,
        meal_type: 'lunch' as any,
        date: mealPlan.date,
        created_by: user.id,
        slot_index: 0,
        is_leftover: true,
        leftover_servings: servingsToSave,
        planned_servings: servingsToSave, // Use planned_servings for the leftover meal
        original_servings: recipe?.servings || mealPlan.planned_servings || 2,
        parent_meal_plan_id: mealPlan.id,
        household_id: currentHousehold.id,
        week_key: currentWeek,
        // For custom meals, include the meal name
        ...(mealPlan.is_freetyped && { 
          is_freetyped: true, 
          meal_name: mealName 
        }),
      };

      console.log("✅ Creating leftover meal with data:", leftoverData);

      await addMealPlan(leftoverData, currentWeek);
      console.log("✅ Leftover meal created successfully");

      // Refresh meal plans to ensure UI shows updated data
      if (refreshMealPlans) {
        console.log("✅ Refreshing meal plans to update UI");
        refreshMealPlans();
      }
      
      toast({
        title: "Leftover Added",
        description: `${servingsToSave} servings of ${mealName} saved for lunch leftovers.`,
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
