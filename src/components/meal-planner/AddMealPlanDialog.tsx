
import { MealPlannerRecipeSelection } from "./MealPlannerRecipeSelection";
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
    console.log("Selected recipe for manual add:", recipeId);
    onAddMealPlan(recipeId, "");
  };

  return (
    <MealPlannerRecipeSelection
      open={isOpen}
      onClose={onClose}
      mealType={selectedMealType}
      recipes={recipes}
      onSelectRecipe={handleSelectRecipe}
    />
  );
}
