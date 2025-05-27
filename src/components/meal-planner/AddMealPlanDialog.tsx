
import { EnhancedAddRecipeToMealModal } from "./EnhancedAddRecipeToMealModal";
import { Recipe, MealType } from "@/types";

interface AddMealPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMealPlan: (recipeId: string, notes: string) => void;
  recipes: Recipe[];
  selectedDate: Date;
  selectedMealType: MealType;
}

export function AddMealPlanDialog({
  isOpen,
  onClose,
  onAddMealPlan,
  recipes,
  selectedMealType,
}: AddMealPlanDialogProps) {
  const handleSelectRecipe = (recipeId: string) => {
    onAddMealPlan(recipeId, "");
  };

  return (
    <EnhancedAddRecipeToMealModal
      open={isOpen}
      onClose={onClose}
      mealType={selectedMealType}
      recipes={recipes}
      onSelectRecipe={handleSelectRecipe}
    />
  );
}
