import { useState, useEffect } from "react";
import { MealType } from "@/types";

const WEEK_STORAGE_KEY = "meal-planner-current-week";

export const useMealPlannerState = () => {
  // Initialize currentWeek from localStorage or default to 1
  const [currentWeek, setCurrentWeekState] = useState<1 | 2>(() => {
    if (typeof window === 'undefined') return 1; // SSR safety
    
    try {
      const savedWeek = localStorage.getItem(WEEK_STORAGE_KEY);
      console.log('Initial load - saved week from localStorage:', savedWeek);
      if (savedWeek === "1" || savedWeek === "2") {
        console.log('Using saved week:', savedWeek);
        return parseInt(savedWeek) as 1 | 2;
      }
    } catch (error) {
      console.warn("Failed to read week from localStorage:", error);
    }
    console.log('No valid saved week found, defaulting to week 1');
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
    console.log('Setting current week to:', week);
    try {
      localStorage.setItem(WEEK_STORAGE_KEY, week.toString());
      console.log('Successfully saved week to localStorage:', week);
    } catch (error) {
      console.warn("Failed to save week to localStorage:", error);
    }
    setCurrentWeekState(week);
  };

  // Effect to sync with localStorage changes (for multiple tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === WEEK_STORAGE_KEY && e.newValue) {
        const newWeek = parseInt(e.newValue) as 1 | 2;
        if ((newWeek === 1 || newWeek === 2) && newWeek !== currentWeek) {
          console.log('Week changed in another tab, syncing:', newWeek);
          setCurrentWeekState(newWeek);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
