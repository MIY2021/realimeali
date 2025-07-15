
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

  const handleAddFreetypeMeal = (mealName: string) => {
    console.log("Add freetype meal:", mealName);
    // This is handled by the parent component
  };

  return (
    <MealPlannerRecipeSelection
      open={isOpen}
      onClose={onClose}
      mealType={selectedMealType}
      recipes={recipes}
      onSelectRecipe={handleSelectRecipe}
      onAddFreetypeMeal={handleAddFreetypeMeal}
    />
  );
}
