import { useState, useEffect } from "react";
import { MealType } from "@/types";
import { getCurrentWeekKey, getNextWeek } from "@/utils/weekUtils";

const WEEK_STORAGE_KEY = "meal-planner-current-week";

export const useMealPlannerState = () => {
  // Initialize currentWeek from localStorage or default to current week
  const [currentWeek, setCurrentWeekState] = useState<string>(() => {
    if (typeof window === 'undefined') {
      // SSR safety - return current week key
      const now = new Date();
      return `${now.getFullYear()}-W01`; // Fallback
    }
    
    try {
      const savedWeek = localStorage.getItem(WEEK_STORAGE_KEY);
      console.log('Initial load - saved week from localStorage:', savedWeek);
      
      // Check if it's a legacy value (1 or 2) or a valid ISO week key
      if (savedWeek === "1" || savedWeek === "2") {
        // Legacy migration: map Week 1 → current week, Week 2 → next week
        const currentKey = getCurrentWeekKey();
        if (savedWeek === "1") {
          return currentKey;
        } else {
          // Get next week
          return getNextWeek(currentKey);
        }
      } else if (savedWeek && /^\d{4}-W\d{1,2}$/.test(savedWeek)) {
        // Valid ISO week key
        console.log('Using saved week key:', savedWeek);
        return savedWeek;
      }
    } catch (error) {
      console.warn("Failed to read week from localStorage:", error);
    }
    
    // Default to current week
    const currentKey = getCurrentWeekKey();
    console.log('No valid saved week found, defaulting to current week:', currentKey);
    return currentKey;
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
  const setCurrentWeek = (week: string) => {
    console.log('Setting current week to:', week);
    try {
      localStorage.setItem(WEEK_STORAGE_KEY, week);
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
        // Handle both legacy (1/2) and new (ISO week key) formats
        if (e.newValue === "1" || e.newValue === "2") {
          // Legacy format - migrate on the fly
          const currentKey = getCurrentWeekKey();
          const newKey = e.newValue === "1" ? currentKey : getNextWeek(currentKey);
          if (newKey !== currentWeek) {
            console.log('Week changed in another tab (legacy format), syncing:', newKey);
            setCurrentWeekState(newKey);
          }
        } else if (e.newValue && /^\d{4}-W\d{1,2}$/.test(e.newValue) && e.newValue !== currentWeek) {
          console.log('Week changed in another tab, syncing:', e.newValue);
          setCurrentWeekState(e.newValue);
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
