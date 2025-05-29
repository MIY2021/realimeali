
import { useState } from "react";
import {
  MealPlanReplaceDialog,
} from "@/components/meal-planner/MealPlanReplaceDialog";
import {
  AddRecipeToMealModal,
} from "@/components/meal-planner/AddRecipeToMealModal";
import {
  AddMealWithLeftoversDialog,
} from "@/components/meal-planner/AddMealWithLeftoversDialog";
import { MealQuantityDialog } from "./MealQuantityDialog";
import { MealPlanMealType } from "@/types";

interface MealPlannerModalsProps {
  isReplaceDialogOpen: boolean;
  setIsReplaceDialogOpen: (open: boolean) => void;
  isAddToMealModalOpen: boolean;
  setIsAddToMealModalOpen: (open: boolean) => void;
  isAddLeftoversModalOpen: boolean;
  setIsAddLeftoversModalOpen: (open: boolean) => void;
  weekNumber: 1 | 2;
  onReplaceMealPlan: () => void;
  mealSlot:
    | { date: string; mealType: MealPlanMealType; slotIndex: number }
    | undefined;
  onAddRecipe: (recipeId: string, servings: number) => Promise<void>;
  onAddMeal: (mealType: MealPlanMealType, servings: number) => void;
}

export function MealPlannerModals({
  isReplaceDialogOpen,
  setIsReplaceDialogOpen,
  isAddToMealModalOpen,
  setIsAddToMealModalOpen,
  isAddLeftoversModalOpen,
  setIsAddLeftoversModalOpen,
  weekNumber,
  onReplaceMealPlan,
  mealSlot,
  onAddRecipe,
  onAddMeal,
}: MealPlannerModalsProps) {
  const [isQuantityDialogOpen, setIsQuantityDialogOpen] = useState(false);
  const [pendingMeal, setPendingMeal] = useState<{ mealType: MealPlanMealType; recipeName: string } | null>(null);

  return (
    <>
      <MealPlanReplaceDialog
        open={isReplaceDialogOpen}
        onOpenChange={setIsReplaceDialogOpen}
        onConfirm={onReplaceMealPlan}
        weekNumber={weekNumber}
      />

      <AddRecipeToMealModal
        open={isAddToMealModalOpen}
        onClose={() => setIsAddToMealModalOpen(false)}
        mealSlot={mealSlot}
        onAddRecipe={async (recipeId: string, servings: number) => {
          if (mealSlot) {
            await onAddRecipe(recipeId, servings);
            setIsAddToMealModalOpen(false);
          }
        }}
      />

      <AddMealWithLeftoversDialog
        open={isAddLeftoversModalOpen}
        onOpenChange={setIsAddLeftoversModalOpen}
        onAddMeal={(mealType: MealPlanMealType, recipeName: string) => {
          setIsAddLeftoversModalOpen(false);
          setPendingMeal({ mealType, recipeName });
          setIsQuantityDialogOpen(true);
        }}
      />
      
      <MealQuantityDialog
        isOpen={isQuantityDialogOpen}
        onClose={() => setIsQuantityDialogOpen(false)}
        onConfirm={(quantity: number) => {
          if (pendingMeal) {
            onAddMeal(pendingMeal.mealType, quantity);
          }
          setIsQuantityDialogOpen(false);
          setPendingMeal(null);
        }}
        mealType={pendingMeal?.mealType || 'dinner'}
        recipeName={pendingMeal?.recipeName || ''}
      />
    </>
  );
}
