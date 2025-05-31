
import { useCallback } from "react";
import { Recipe } from "@/types";
import { mealPlanService } from "@/services/mealPlanService";

interface UseLeftoverOperationsProps {
  user: any;
  currentHousehold: any;
  currentWeek: 1 | 2;
  addMealPlan: any;
  toast: any;
}

export const useLeftoverOperations = ({
  user,
  currentHousehold,
  currentWeek,
  addMealPlan,
  toast,
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

      // Ensure we have a positive integer servings value - this is crucial for the DB constraint
      let servingsToSave: number;
      if (leftoverServings && Number.isInteger(leftoverServings) && leftoverServings > 0) {
        servingsToSave = leftoverServings;
      } else {
        servingsToSave = Math.max(1, Math.floor(recipe.servings / 2));
      }
      
      console.log("✅ Calculated servings to save (must be positive integer):", servingsToSave, typeof servingsToSave);
      console.log("✅ Database constraint check: is_leftover=true, leftover_servings > 0:", servingsToSave > 0);
      
      const leftoverData = {
        recipe_id: mealPlan.recipe_id,
        meal_type: 'lunch' as any,
        date: mealPlan.date,
        created_by: user.id,
        slot_index: 0,
        is_leftover: true,
        leftover_servings: servingsToSave, // This must be a positive integer for DB constraint
        original_servings: recipe.servings,
        parent_meal_plan_id: mealPlan.id,
        household_id: currentHousehold.id,
        week_number: currentWeek,
      };

      console.log("✅ Creating leftover meal with data:", leftoverData);
      console.log("✅ Constraint validation: is_leftover=true AND leftover_servings > 0 =", leftoverData.is_leftover === true && leftoverData.leftover_servings > 0);

      // Create the leftover meal
      await addMealPlan(leftoverData, currentWeek);
      console.log("✅ Leftover meal created successfully");

      // Update the original dinner meal to track leftover allocation
      console.log("✅ Updating original meal plan leftover allocation");
      await mealPlanService.updateMealPlanLeftoverAllocation(
        mealPlan.id,
        servingsToSave,
        currentHousehold.id
      );
      console.log("✅ Original meal plan updated successfully");

      const remainingServings = recipe.servings - servingsToSave;
      
      toast({
        title: "Leftover Added",
        description: `${servingsToSave} servings of ${recipe.title} saved for lunch. Dinner now shows ${remainingServings} servings.`,
      });
    } catch (err) {
      console.error("💥 Error creating leftover:", err);
      console.error("Error details:", {
        message: err?.message,
        stack: err?.stack,
        name: err?.name
      });
      toast({
        title: "Error",
        description: `Failed to create leftover meal: ${err?.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  }, [user, currentHousehold, currentWeek, addMealPlan, toast]);

  return {
    handleCreateLeftover,
  };
};
