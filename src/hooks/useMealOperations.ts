
import { useCallback } from "react";
import { MealType } from "@/types";

interface UseMealOperationsProps {
  user: any;
  currentHousehold: any;
  recipes: any[];
  currentWeek: 1 | 2;
  addMealPlan: any;
  removeMealPlan: any;
  reorderMealPlans: any;
  setAddMealModal: any;
  setPendingMealType: (mealType: MealType | null) => void;
  setServingsDialog: (open: boolean) => void;
  toast: any;
}

export const useMealOperations = ({
  user,
  currentHousehold,
  recipes,
  currentWeek,
  addMealPlan,
  removeMealPlan,
  reorderMealPlans,
  setAddMealModal,
  setPendingMealType,
  setServingsDialog,
  toast,
}: UseMealOperationsProps) => {

  const handleAddRecipeToMeal = useCallback(async (recipe_id: string, mealType: MealType) => {
    if (!user || !currentHousehold) return;

    const recipe = recipes.find(r => r.id === recipe_id);
    if (!recipe) return;

    try {
      const mealPlanData = {
        recipe_id: recipe_id,
        meal_type: mealType,
        date: new Date().toISOString().split('T')[0],
        created_by: user.id,
        slot_index: 0,
        is_leftover: false,
        household_id: currentHousehold.id,
        week_number: currentWeek,
        original_servings: recipe.servings,
      };

      await addMealPlan(mealPlanData, currentWeek);
      setAddMealModal({ open: false, mealType: null, date: null });
      
      toast({
        title: "Meal Added",
        description: `${recipe.title} added to ${mealType}`,
      });
    } catch (err) {
      console.error("Error adding meal plan:", err);
      toast({
        title: "Error",
        description: "Failed to add meal to plan",
        variant: "destructive",
      });
    }
  }, [user, currentHousehold, recipes, currentWeek, addMealPlan, setAddMealModal, toast]);

  const handleAddMeal = useCallback((mealType: MealType) => {
    console.log("🍽️ handleAddMeal called with mealType:", mealType);
    setPendingMealType(mealType);
    setServingsDialog(true);
    console.log("✅ Set pending meal type and opened servings dialog");
  }, [setPendingMealType, setServingsDialog]);

  const handleRemoveMeal = useCallback(async (planId: string) => {
    try {
      await removeMealPlan(planId);
      toast({
        title: "Meal Removed",
        description: "Meal removed from plan",
      });
    } catch (err) {
      console.error("Error removing meal:", err);
      toast({
        title: "Error",
        description: "Failed to remove meal",
        variant: "destructive",
      });
    }
  }, [removeMealPlan, toast]);

  const handleReorderMeals = useCallback(async (mealType: MealType, sourceIndex: number, destinationIndex: number) => {
    try {
      await reorderMealPlans(mealType, currentWeek, sourceIndex, destinationIndex);
    } catch (err) {
      console.error("Error reordering meals:", err);
      toast({
        title: "Error",
        description: "Failed to reorder meals",
        variant: "destructive",
      });
    }
  }, [reorderMealPlans, currentWeek, toast]);

  return {
    handleAddRecipeToMeal,
    handleAddMeal,
    handleRemoveMeal,
    handleReorderMeals,
  };
};
