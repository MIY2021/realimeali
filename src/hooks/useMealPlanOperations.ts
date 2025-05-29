import { useState } from "react";
import { useMealPlans } from "@/contexts/MealPlanContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { MealPlan, MealPlanMealType } from "@/types";

export function useMealPlanOperations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mealPlans, fetchMealPlans, createMealPlan, updateMealPlan, deleteMealPlan } = useMealPlans();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
    setError(null);
  };

  const setErrorState = (message: string) => {
    setIsLoading(false);
    setError(message);
  };

  const addMealPlan = async (
    mealPlanData: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>,
    weekNumber: 1 | 2
  ) => {
    if (!user || !currentHousehold) {
      throw new Error('User must be logged in and have a household');
    }

    try {
      // Convert MealType to MealPlanMealType if needed
      const validMealTypes: MealPlanMealType[] = ["breakfast", "lunch", "dinner", "snacks"];
      const mealType = validMealTypes.includes(mealPlanData.mealType as MealPlanMealType) 
        ? mealPlanData.mealType as MealPlanMealType
        : "dinner"; // fallback

      const mealPlan = await createMealPlan({
        ...mealPlanData,
        mealType, // Use converted type
        householdId: currentHousehold.id,
        weekNumber,
      });
      
      await createMealPlan({
        ...mealPlanData,
        mealType, // Use converted type
        householdId: currentHousehold.id,
        weekNumber,
      });

      await fetchMealPlans(currentHousehold.id);
      
      return mealPlan;
    } catch (error) {
      console.error('Error adding meal plan:', error);
      throw error;
    }
  };

  const editMealPlan = async (id: string, updates: Partial<MealPlan>) => {
    if (!user || !currentHousehold) {
      throw new Error('User must be logged in and have a household');
    }

    try {
      setLoading(true);
      const updatedMealPlan = await updateMealPlan(id, updates);
      await fetchMealPlans(currentHousehold.id);
      setLoading(false);
      return updatedMealPlan;
    } catch (error) {
      setErrorState('Failed to update meal plan');
      throw error;
    }
  };

  const removeMealPlan = async (id: string) => {
    if (!user || !currentHousehold) {
      throw new Error('User must be logged in and have a household');
    }

    try {
      setLoading(true);
      await deleteMealPlan(id);
      await fetchMealPlans(currentHousehold.id);
      setLoading(false);
    } catch (error) {
      setErrorState('Failed to remove meal plan');
      throw error;
    }
  };

  return {
    mealPlans,
    isLoading,
    error,
    addMealPlan,
    editMealPlan,
    removeMealPlan,
    fetchMealPlans
  };
}
