
import { useState } from "react";
import { MealType } from "@/types";

export const useMealPlannerState = () => {
  const [currentWeek, setCurrentWeek] = useState<1 | 2>(1);
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
