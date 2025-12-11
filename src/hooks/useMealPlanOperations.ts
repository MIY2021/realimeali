
import { useState } from "react";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { MealPlan, MealType } from "@/types";

export function useMealPlanOperations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addMealPlan, removeMealPlan } = useMealPlan();
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

  const addMealPlanOperation = async (
    mealPlanData: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>,
    weekKey: string
  ) => {
    if (!user || !currentHousehold) {
      throw new Error('User must be logged in and have a household');
    }

    try {
      setLoading(true);
      await addMealPlan(mealPlanData, weekKey);
      setLoading(false);
    } catch (error) {
      console.error('Error adding meal plan:', error);
      setErrorState('Failed to add meal plan');
      throw error;
    }
  };

  const removeMealPlanOperation = async (id: string) => {
    if (!user || !currentHousehold) {
      throw new Error('User must be logged in and have a household');
    }

    try {
      setLoading(true);
      await removeMealPlan(id);
      setLoading(false);
    } catch (error) {
      setErrorState('Failed to remove meal plan');
      throw error;
    }
  };

  return {
    isLoading,
    error,
    addMealPlan: addMealPlanOperation,
    removeMealPlan: removeMealPlanOperation,
  };
}
