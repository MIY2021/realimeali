
import { MealType } from "@/types";
import { useMealOperations } from "./useMealOperations";
import { useLeftoverOperations } from "./useLeftoverOperations";
import { useMealPlanGeneration } from "./useMealPlanGeneration";
import { useMealPlanSharing } from "./useMealPlanSharing";

interface UseMealPlannerOperationsProps {
  user: any;
  currentHousehold: any;
  recipes: any[];
  currentWeek: 1 | 2;
  addMealPlan: any;
  removeMealPlan: any;
  clearWeek: any;
  reorderMealPlans: any;
  generateRandomMealPlan: (quantities: any, weekNumber: 1 | 2) => Promise<number>;
  setAddMealModal: any;
  setIsLoading: (loading: boolean) => void;
  toast: any;
  setQuantitiesDialog: (open: boolean) => void;
  setServingsDialog: (open: boolean) => void;
  setPendingMealType: (mealType: MealType | null) => void;
  setClearAllDialog?: (open: boolean) => void;
}

export const useMealPlannerOperations = (props: UseMealPlannerOperationsProps) => {
  const mealOperations = useMealOperations({
    user: props.user,
    currentHousehold: props.currentHousehold,
    recipes: props.recipes,
    currentWeek: props.currentWeek,
    addMealPlan: props.addMealPlan,
    removeMealPlan: props.removeMealPlan,
    reorderMealPlans: props.reorderMealPlans,
    setAddMealModal: props.setAddMealModal,
    setPendingMealType: props.setPendingMealType,
    setServingsDialog: props.setServingsDialog,
    toast: props.toast,
  });

  const leftoverOperations = useLeftoverOperations({
    user: props.user,
    currentHousehold: props.currentHousehold,
    currentWeek: props.currentWeek,
    addMealPlan: props.addMealPlan,
    toast: props.toast,
  });

  const generationOperations = useMealPlanGeneration({
    user: props.user,
    currentHousehold: props.currentHousehold,
    currentWeek: props.currentWeek,
    generateRandomMealPlan: props.generateRandomMealPlan,
    clearWeek: props.clearWeek,
    setIsLoading: props.setIsLoading,
    setQuantitiesDialog: props.setQuantitiesDialog,
    toast: props.toast,
    recipes: props.recipes,
  });

  const sharingOperations = useMealPlanSharing({
    user: props.user,
    currentHousehold: props.currentHousehold,
    currentWeek: props.currentWeek,
    clearWeek: props.clearWeek,
    setIsLoading: props.setIsLoading,
    setClearAllDialog: props.setClearAllDialog,
    toast: props.toast,
  });

  return {
    ...mealOperations,
    ...leftoverOperations,
    ...generationOperations,
    ...sharingOperations,
  };
};
