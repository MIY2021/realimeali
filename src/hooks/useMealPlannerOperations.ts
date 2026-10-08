
import { MealType } from "@/types";
import { useMealOperations } from "./useMealOperations";
import { useLeftoverOperations } from "./useLeftoverOperations";
import { useMealPlanSharing } from "./useMealPlanSharing";

interface UseMealPlannerOperationsProps {
  user: any;
  currentHousehold: any;
  recipes: any[];
  currentWeek: string; // ISO week key
  addMealPlan: any;
  removeMealPlan: any;
  clearWeek: any;
  reorderMealPlans: any;
  setAddMealModal: any;
  toast: any;
  setServingsDialog: (open: boolean) => void;
  setPendingMealType: (mealType: MealType | null) => void;
  setClearAllDialog?: (open: boolean) => void;
  refreshMealPlans?: () => Promise<void>;
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
    refreshMealPlans: props.refreshMealPlans,
  });

  const sharingOperations = useMealPlanSharing({
    user: props.user,
    currentHousehold: props.currentHousehold,
    currentWeek: props.currentWeek,
    clearWeek: props.clearWeek,
    setIsLoading: props.setIsLoading,
    setClearAllDialog: props.setClearAllDialog,
    toast: props.toast,
    mealPlans: props.currentMealPlans,
    recipes: props.recipes,
  });

  return {
    ...mealOperations,
    ...leftoverOperations,
    ...sharingOperations,
  };
};
