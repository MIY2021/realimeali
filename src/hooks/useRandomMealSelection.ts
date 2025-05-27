
import { MealType } from "@/types";
import { useRandomMealCore } from "./useRandomMealSelection/useRandomMealCore";
import { useRandomMealValidation } from "./useRandomMealSelection/useRandomMealValidation";
import { MealSelectionCallbacks } from "./useRandomMealSelection/types";

export { DEFAULT_MEAL_QUANTITIES } from "./useRandomMealSelection/types";

export const useRandomMealSelection = (week: 1 | 2): MealSelectionCallbacks & { isLoading: boolean; showReplaceDialog: boolean; showQuantityDialog: boolean; setShowReplaceDialog: (show: boolean) => void; setShowQuantityDialog: (show: boolean) => void } => {
  const { state, setState, performMealSelection, getMealPlansForWeek, recipes, user, currentHousehold } = useRandomMealCore(week);
  const { validateUserAndHousehold, validateRecipes } = useRandomMealValidation();

  const handleRandomize = async () => {
    console.log("=== HANDLE RANDOMIZE CLICKED ===");
    console.log("User:", user?.id);
    console.log("Household:", currentHousehold?.id);
    console.log("Recipes count:", recipes.length);

    if (!validateUserAndHousehold(user, currentHousehold)) {
      console.log("User/household validation failed");
      return;
    }

    if (!validateRecipes(recipes)) {
      console.log("Recipe validation failed");
      return;
    }

    const currentWeekPlans = getMealPlansForWeek(week);
    console.log("Current week plans:", currentWeekPlans.length);
    
    if (currentWeekPlans.length > 0) {
      console.log("Showing replace dialog - existing plans found");
      setState(prev => ({ ...prev, showReplaceDialog: true }));
      return;
    }
    
    console.log("No existing plans - showing quantity dialog");
    setState(prev => ({ ...prev, showQuantityDialog: true }));
  };

  const handleReplaceConfirm = () => {
    console.log("Replace confirmed - showing quantity dialog");
    setState(prev => ({ ...prev, showReplaceDialog: false, showQuantityDialog: true }));
  };

  const handleQuantityConfirm = async (quantities: Record<MealType, number>) => {
    console.log("Quantity confirmed:", quantities);
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
