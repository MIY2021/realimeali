
import { useState } from "react";
import { MealType, MealPlan, Recipe } from "@/types";

export const useMealPlanModals = () => {
  const [addMealModal, setAddMealModal] = useState<{
    open: boolean;
    mealType: MealType | null;
    date: string | null;
  }>({ open: false, mealType: null, date: null });

  const [editMealModal, setEditMealModal] = useState<{
    open: boolean;
    mealPlan: MealPlan | null;
    recipe: Recipe | null;
  }>({ open: false, mealPlan: null, recipe: null });

  const [removeMealModal, setRemoveMealModal] = useState<{
    open: boolean;
    mealPlan: MealPlan | null;
  }>({ open: false, mealPlan: null });

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
    editMealModal,
    setEditMealModal,
    removeMealModal,
    setRemoveMealModal,
    leftoverModal,
    setLeftoverModal,
    clearMealPlanDialog,
    setClearMealPlanDialog,
    deleteMealDialog,
    setDeleteMealDialog,
  };
};
