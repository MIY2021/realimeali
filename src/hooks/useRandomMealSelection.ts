
import { MealType } from "@/types";
import { useRandomMealCore } from "./useRandomMealSelection/useRandomMealCore";
import { useRandomMealValidation } from "./useRandomMealSelection/useRandomMealValidation";
import { MealSelectionCallbacks } from "./useRandomMealSelection/types";

export { DEFAULT_MEAL_QUANTITIES } from "./useRandomMealSelection/types";

export const useRandomMealSelection = (week: 1 | 2): MealSelectionCallbacks & { isLoading: boolean; showReplaceDialog: boolean; showQuantityDialog: boolean; setShowReplaceDialog: (show: boolean) => void; setShowQuantityDialog: (show: boolean) => void } => {
  const { state, setState, performMealSelection, getMealPlansForWeek, recipes, user, currentHousehold } = useRandomMealCore(week);
  const { validateUserAndHousehold, validateRecipes } = useRandomMealValidation();

  const handleRandomize = async () => {
    if (!validateUserAndHousehold(user, currentHousehold)) {
      return;
    }

    if (!validateRecipes(recipes)) {
      return;
    }

    const currentWeekPlans = getMealPlansForWeek(week);
    if (currentWeekPlans.length > 0) {
      setState(prev => ({ ...prev, showReplaceDialog: true }));
      return;
    }
    
    setState(prev => ({ ...prev, showQuantityDialog: true }));
  };

  const handleReplaceConfirm = () => {
    setState(prev => ({ ...prev, showReplaceDialog: false, showQuantityDialog: true }));
  };

  const handleQuantityConfirm = async (quantities: Record<MealType, number>) => {
    setState(prev => ({ ...prev, showQuantityDialog: false }));
    await performMealSelection(quantities);
  };

  const setShowReplaceDialog = (show: boolean) => {
    setState(prev => ({ ...prev, showReplaceDialog: show }));
  };

  const setShowQuantityDialog = (show: boolean) => {
    setState(prev => ({ ...prev, showQuantityDialog: show }));
  };

  return { 
    handleRandomize, 
    performMealSelection,
    isLoading: state.isLoading,
    showReplaceDialog: state.showReplaceDialog,
    setShowReplaceDialog,
    showQuantityDialog: state.showQuantityDialog,
    setShowQuantityDialog,
    handleReplaceConfirm,
    handleQuantityConfirm
  };
};
