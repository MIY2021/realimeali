
import { useState, useEffect } from "react";
import { MealType } from "@/types";

const WEEK_STORAGE_KEY = "meal-planner-current-week";

export const useMealPlannerState = () => {
  // Initialize currentWeek from localStorage or default to 1
  const [currentWeek, setCurrentWeekState] = useState<1 | 2>(() => {
    try {
      const savedWeek = localStorage.getItem(WEEK_STORAGE_KEY);
      if (savedWeek && (savedWeek === "1" || savedWeek === "2")) {
        return parseInt(savedWeek) as 1 | 2;
      }
    } catch (error) {
      console.warn("Failed to read week from localStorage:", error);
    }
    return 1;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [quantitiesDialog, setQuantitiesDialog] = useState(false);
  const [servingsDialog, setServingsDialog] = useState(false);
  const [simpleMealDialog, setSimpleMealDialog] = useState(false);
  const [leftoverDialog, setLeftoverDialog] = useState(false);
  const [warningDialog, setWarningDialog] = useState(false);
  const [clearAllDialog, setClearAllDialog] = useState(false);
  const [pendingMealType, setPendingMealType] = useState<MealType | null>(null);
  const [pendingLeftoverData, setPendingLeftoverData] = useState<{
    mealPlan: any;
    recipe: any;
  } | null>(null);

  // Wrapper function to persist week changes to localStorage
  const setCurrentWeek = (week: 1 | 2) => {
    try {
      localStorage.setItem(WEEK_STORAGE_KEY, week.toString());
    } catch (error) {
      console.warn("Failed to save week to localStorage:", error);
    }
    setCurrentWeekState(week);
  };

  // Cleanup on unmount - save current state
  useEffect(() => {
    return () => {
      try {
        localStorage.setItem(WEEK_STORAGE_KEY, currentWeek.toString());
      } catch (error) {
        console.warn("Failed to save week on cleanup:", error);
      }
    };
  }, [currentWeek]);

  return {
    currentWeek,
    setCurrentWeek,
    isLoading,
    setIsLoading,
    quantitiesDialog,
    setQuantitiesDialog,
    servingsDialog,
    setServingsDialog,
    simpleMealDialog,
    setSimpleMealDialog,
    leftoverDialog,
    setLeftoverDialog,
    warningDialog,
    setWarningDialog,
    clearAllDialog,
    setClearAllDialog,
    pendingMealType,
    setPendingMealType,
    pendingLeftoverData,
    setPendingLeftoverData,
  };
};
