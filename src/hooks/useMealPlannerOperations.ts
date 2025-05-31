
import { useCallback } from "react";
import { MealType, Recipe } from "@/types";

interface UseMealPlannerOperationsProps {
  user: any;
  currentHousehold: any;
  recipes: Recipe[];
  currentWeek: 1 | 2;
  addMealPlan: any;
  removeMealPlan: any;
  clearWeek: any;
  reorderMealPlans: any;
  generateRandomMealPlan: any;
  setAddMealModal: any;
  setIsLoading: (loading: boolean) => void;
  toast: any;
}

export const useMealPlannerOperations = ({
  user,
  currentHousehold,
  recipes,
  currentWeek,
  addMealPlan,
  removeMealPlan,
  clearWeek,
  reorderMealPlans,
  generateRandomMealPlan,
  setAddMealModal,
  setIsLoading,
  toast,
}: UseMealPlannerOperationsProps) => {

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
    setAddMealModal({ open: true, mealType, date: null });
  }, [setAddMealModal]);

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

  const handleCreateLeftover = useCallback(async (mealPlan: any, recipe: Recipe) => {
    if (!user || !currentHousehold) return;

    try {
      const leftoverData = {
        recipe_id: mealPlan.recipe_id,
        meal_type: 'lunch' as MealType,
        date: mealPlan.date,
        created_by: user.id,
        slot_index: 0,
        is_leftover: true,
        leftover_servings: Math.ceil(recipe.servings / 2),
        original_servings: recipe.servings,
        parent_meal_plan_id: mealPlan.id,
        household_id: currentHousehold.id,
        week_number: currentWeek,
      };

      await addMealPlan(leftoverData, currentWeek);
      
      toast({
        title: "Leftover Added",
        description: `${recipe.title} leftovers added to lunch`,
      });
    } catch (err) {
      console.error("Error creating leftover:", err);
      toast({
        title: "Error",
        description: "Failed to create leftover meal",
        variant: "destructive",
      });
    }
  }, [user, currentHousehold, currentWeek, addMealPlan, toast]);

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

  const handleRandomize = useCallback(async () => {
    if (!user || !currentHousehold) return;
    
    setIsLoading(true);
    try {
      await generateRandomMealPlan({
        dinner: 5,
        lunch: 2,
        breakfast: 2,
        snacks: 2
      });
      toast({
        title: "Meal Plan Generated",
        description: `Random meal plan created for week ${currentWeek}`,
      });
    } catch (err) {
      console.error("Error generating meal plan:", err);
      toast({
        title: "Error",
        description: "Failed to generate meal plan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, currentHousehold, currentWeek, generateRandomMealPlan, setIsLoading, toast]);

  const handleShare = useCallback(() => {
    toast({
      title: "Share",
      description: "Share functionality coming soon!",
    });
  }, [toast]);

  const handleClearAll = useCallback(async () => {
    if (!user || !currentHousehold) return;
    
    const confirmed = window.confirm(`Are you sure you want to clear all meals for week ${currentWeek}?`);
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await clearWeek(currentWeek);
      toast({
        title: "Week Cleared",
        description: `All meals cleared for week ${currentWeek}`,
      });
    } catch (err) {
      console.error("Error clearing week:", err);
      toast({
        title: "Error",
        description: "Failed to clear week",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, currentHousehold, currentWeek, clearWeek, setIsLoading, toast]);

  return {
    handleAddRecipeToMeal,
    handleAddMeal,
    handleRemoveMeal,
    handleCreateLeftover,
    handleReorderMeals,
    handleRandomize,
    handleShare,
    handleClearAll,
  };
};
