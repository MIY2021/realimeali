
import { MealType } from "@/types";

export interface MealSelectionState {
  isLoading: boolean;
  showReplaceDialog: boolean;
  showQuantityDialog: boolean;
}

export interface MealSelectionCallbacks {
  handleRandomize: () => Promise<void>;
  performMealSelection: (customQuantities?: Record<MealType, number>) => Promise<void>;
  handleReplaceConfirm: () => void;
  handleQuantityConfirm: (quantities: Record<MealType, number>) => Promise<void>;
  setShowReplaceDialog: (show: boolean) => void;
  setShowQuantityDialog: (show: boolean) => void;
}

export const DEFAULT_MEAL_QUANTITIES: Record<MealType, number> = {
  dinner: 5,
  lunch: 2,
  breakfast: 2,
  snacks: 2,
};
