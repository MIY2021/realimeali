
import { useState, useEffect, useRef } from "react";
import { MealType } from "@/types";

const WEEK_STORAGE_KEY = "meal-planner-current-week";

export const useMealPlannerState = () => {
  // Use ref to track if we've initialized from localStorage
  const hasInitialized = useRef(false);
  
  // Initialize currentWeek from localStorage or default to 1
  const [currentWeek, setCurrentWeekState] = useState<1 | 2>(() => {
    if (typeof window === 'undefined') return 1; // SSR safety
    
    try {
      const savedWeek = localStorage.getItem(WEEK_STORAGE_KEY);
      console.log('Loading saved week from localStorage:', savedWeek);
      if (savedWeek && (savedWeek === "1" || savedWeek === "2")) {
        hasInitialized.current = true;
        return parseInt(savedWeek) as 1 | 2;
      }
    } catch (error) {
      console.warn("Failed to read week from localStorage:", error);
    }
    console.log('Defaulting to week 1');
    hasInitialized.current = true;
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

  // Effect to ensure localStorage sync on mount (handles edge cases)
  useEffect(() => {
    if (hasInitialized.current && typeof window !== 'undefined') {
      try {
        const savedWeek = localStorage.getItem(WEEK_STORAGE_KEY);
        if (savedWeek && (savedWeek === "1" || savedWeek === "2")) {
          const parsedWeek = parseInt(savedWeek) as 1 | 2;
          if (parsedWeek !== currentWeek) {
            console.log('Syncing week from localStorage on mount:', parsedWeek);
            setCurrentWeekState(parsedWeek);
          }
        }
      } catch (error) {
        console.warn("Failed to sync week from localStorage:", error);
      }
    }
  }, []); // Only run once on mount

  // Cleanup on unmount - save current state
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(WEEK_STORAGE_KEY, currentWeek.toString());
        } catch (error) {
          console.warn("Failed to save week on cleanup:", error);
        }
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
