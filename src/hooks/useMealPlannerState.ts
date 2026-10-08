import { useState, useEffect } from "react";
import { MealType } from "@/types";
import { getCurrentWeekKey, getNextWeek } from "@/utils/weekUtils";

const WEEK_STORAGE_KEY = "meal-planner-current-week";
const WEEK_KEY_PATTERN = /^\d{4}-W\d{1,2}$/;

export const useMealPlannerState = () => {
  // A shared meal-plan link takes precedence over the locally remembered week.
  const [currentWeek, setCurrentWeekState] = useState<string>(() => {
    if (typeof window === 'undefined') {
      const now = new Date();
      return `${now.getFullYear()}-W01`;
    }

    try {
      const sharedWeek = new URLSearchParams(window.location.search).get('week');
      if (sharedWeek && WEEK_KEY_PATTERN.test(sharedWeek)) {
        return sharedWeek;
      }

      const savedWeek = localStorage.getItem(WEEK_STORAGE_KEY);

      if (savedWeek === "1" || savedWeek === "2") {
        const currentKey = getCurrentWeekKey();
        return savedWeek === "1" ? currentKey : getNextWeek(currentKey);
      }

      if (savedWeek && WEEK_KEY_PATTERN.test(savedWeek)) {
        return savedWeek;
      }
    } catch (error) {
      console.warn("Failed to read week from URL/localStorage:", error);
    }

    return getCurrentWeekKey();
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

  const setCurrentWeek = (week: string) => {
    try {
      localStorage.setItem(WEEK_STORAGE_KEY, week);
    } catch (error) {
      console.warn("Failed to save week to localStorage:", error);
    }
    setCurrentWeekState(week);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("generate") === "1") {
      setQuantitiesDialog(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === WEEK_STORAGE_KEY && e.newValue) {
        if (e.newValue === "1" || e.newValue === "2") {
          const currentKey = getCurrentWeekKey();
          const newKey = e.newValue === "1" ? currentKey : getNextWeek(currentKey);
          if (newKey !== currentWeek) {
            setCurrentWeekState(newKey);
          }
        } else if (WEEK_KEY_PATTERN.test(e.newValue) && e.newValue !== currentWeek) {
          setCurrentWeekState(e.newValue);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
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
