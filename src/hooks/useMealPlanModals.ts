
import { useState } from "react";
import { MealType, MealPlan, Recipe } from "@/types";

export const useMealPlanModals = () => {
  const [addMealModal, setAddMealModal] = useState<{
    open: boolean;
    mealType: MealType | null;
  }>({ open: false, mealType: null });

  const [leftoverModal, setLeftoverModal] = useState<{
    open: boolean;
    mealPlan: MealPlan | null;
    recipe: Recipe | null;
  }>({ open: false, mealPlan: null, recipe: null });

  const [clearMealPlanDialog, setClearMealPlanDialog] = useState(false);

  const [deleteMealDialog, setDeleteMealDialog] = useState<{
    open: boolean;
    recipe: Recipe | null;
  }>({ open: false, recipe: null });

  return {
    addMealModal,
    setAddMealModal,
    leftoverModal,
    setLeftoverModal,
    clearMealPlanDialog,
    setClearMealPlanDialog,
    deleteMealDialog,
    setDeleteMealDialog,
  };
};
