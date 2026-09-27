import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { MealPlan } from "@/types";
import { mealPlanService } from "@/services/mealPlanService";
import { getWeekStartDate, parseISOWeekKey, getISOWeekKey, formatLocalDateYMD } from "@/utils/weekUtils";

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
    weekKey: string,
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
        weekKey,
        currentHousehold.id,
        user.id,
        silentMode
      );

      setMealPlans((prev: MealPlan[]) => [...prev, newMealPlan]);

      if (!silentMode) {
        toast({
          title: "Meal Added",
          description: `${recipe?.title || 'Meal'} added to ${mealPlanData.meal_type}`,
        });
      }

      return newMealPlan;
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

  const clearWeek = useCallback(async (weekKey: string) => {
    if (!user || !currentHousehold) {
      throw new Error('User must be logged in and have a household');
    }

    try {
      await mealPlanService.clearWeek(weekKey, currentHousehold.id);
      setMealPlans((prev: MealPlan[]) => prev.filter(plan => plan.week_key !== weekKey));
      toast({
        title: "Week Cleared",
        description: `Week meal plans cleared.`,
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

  const copyWeek = useCallback(async (sourceWeekKey: string, targetWeekKey: string) => {
    if (!user || !currentHousehold) {
      throw new Error('User must be logged in and have a household');
    }

    try {
      // Get all meal plans from source week
      const sourcePlans = mealPlans.filter(plan => {
        const planWeekKey = plan.week_key || getISOWeekKey(new Date(plan.date));
        return planWeekKey === sourceWeekKey;
      });

      if (sourcePlans.length === 0) {
        toast({
          title: "No meals to copy",
          description: "The selected week has no meal plans.",
        });
        return;
      }

      // Get target week start date
      const { year: targetYear, week: targetWeek } = parseISOWeekKey(targetWeekKey);
      const targetWeekStart = getWeekStartDate(targetYear, targetWeek);
      
      // Get source week start date for calculating day offsets
      const { year: sourceYear, week: sourceWeek } = parseISOWeekKey(sourceWeekKey);
      const sourceWeekStart = getWeekStartDate(sourceYear, sourceWeek);

      // Calculate day offset between source and target weeks
      const dayOffset = Math.floor((targetWeekStart.getTime() - sourceWeekStart.getTime()) / (1000 * 60 * 60 * 24));

      // Group plans by parent to handle leftovers
      const parentMap = new Map<string, MealPlan[]>();
      sourcePlans.forEach(plan => {
        if (plan.parent_meal_plan_id) {
          if (!parentMap.has(plan.parent_meal_plan_id)) {
            parentMap.set(plan.parent_meal_plan_id, []);
          }
          parentMap.get(plan.parent_meal_plan_id)!.push(plan);
        }
      });

      // Copy non-leftover plans first, then leftovers
      const nonLeftoverPlans = sourcePlans.filter(plan => !plan.is_leftover);
      const copiedPlanIds = new Map<string, string>(); // Map old ID to new ID for leftover linking

      // Copy non-leftover plans
      for (const sourcePlan of nonLeftoverPlans) {
        const sourceDate = new Date(sourcePlan.date);
        const newDate = new Date(sourceDate);
        newDate.setDate(sourceDate.getDate() + dayOffset);

        const newPlan = await mealPlanService.addMealPlan(
          {
            date: formatLocalDateYMD(newDate),
            meal_type: sourcePlan.meal_type,
            recipe_id: sourcePlan.recipe_id,
            created_by: user.id,
            slot_index: sourcePlan.slot_index,
            is_leftover: false,
            household_id: currentHousehold.id,
            week_key: targetWeekKey,
            original_servings: sourcePlan.original_servings,
            planned_servings: sourcePlan.planned_servings,
            is_completed: false,
            is_freetyped: sourcePlan.is_freetyped || false,
            meal_name: sourcePlan.meal_name || undefined,
          },
          targetWeekKey,
          currentHousehold.id,
          user.id,
          true // silent mode
        );

        copiedPlanIds.set(sourcePlan.id, newPlan.id);

        // Copy leftovers for this plan if they exist
        const leftovers = parentMap.get(sourcePlan.id);
        if (leftovers && leftovers.length > 0) {
          for (const leftover of leftovers) {
            const leftoverDate = new Date(leftover.date);
            const newLeftoverDate = new Date(leftoverDate);
            newLeftoverDate.setDate(leftoverDate.getDate() + dayOffset);

            await mealPlanService.addMealPlan(
              {
                date: formatLocalDateYMD(newLeftoverDate),
                meal_type: leftover.meal_type,
                recipe_id: leftover.recipe_id,
                created_by: user.id,
                slot_index: leftover.slot_index,
                is_leftover: true,
                leftover_servings: leftover.leftover_servings,
                original_servings: leftover.original_servings,
                planned_servings: leftover.planned_servings,
                parent_meal_plan_id: newPlan.id,
                household_id: currentHousehold.id,
                week_key: targetWeekKey,
                is_completed: false,
                is_freetyped: leftover.is_freetyped || false,
                meal_name: leftover.meal_name || undefined,
              },
              targetWeekKey,
              currentHousehold.id,
              user.id,
              true // silent mode
            );
          }
        }
      }

      // Refresh meal plans
      const updatedPlans = await mealPlanService.fetchMealPlans(currentHousehold.id);
      setMealPlans(updatedPlans);

      toast({
        title: "Week Copied",
        description: `Copied ${sourcePlans.length} meal plan${sourcePlans.length !== 1 ? 's' : ''} to the selected week.`,
      });
    } catch (error) {
      console.error("Error copying week:", error);
      toast({
        title: "Error",
        description: "Failed to copy meal plans. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [user?.id, currentHousehold?.id, mealPlans, setMealPlans, toast]);

  return {
    addMealPlan,
    removeMealPlan,
    clearWeek,
    copyWeek,
  };
};
