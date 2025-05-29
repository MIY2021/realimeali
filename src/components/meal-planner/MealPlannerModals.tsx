
import { AddMealPlanDialog } from "@/components/meal-planner/AddMealPlanDialog";
import { LeftoverServingsDialog } from "@/components/meal-planner/LeftoverServingsDialog";
import { MealPlanReplaceDialog } from "@/components/meal-planner/MealPlanReplaceDialog";
import { ClearMealPlanDialog } from "@/components/meal-planner/ClearMealPlanDialog";
import { DeleteMealDialog } from "@/components/meal-planner/DeleteMealDialog";
import { MealQuantityDialog } from "@/components/meal-planner/MealQuantityDialog";
import { MealType } from "@/types";

interface MealPlannerModalsProps {
  // Add meal modal
  addMealModal: { open: boolean; mealType: MealType | null };
  setAddMealModal: (modal: { open: boolean; mealType: MealType | null }) => void;
  recipes: any[];
  onAddMealFinish: (mealType: MealType, recipeId: string) => void;

  // Leftover modal
  leftoverModal: { open: boolean; mealPlan: any; recipe: any };
  setLeftoverModal: (modal: { open: boolean; mealPlan: any; recipe: any }) => void;
  onLeftoverConfirm: (servings: number) => void;

  // Replace dialog
  showReplaceDialog: boolean;
  setShowReplaceDialog: (show: boolean) => void;
  handleReplaceConfirm: () => void;
  currentWeek: 1 | 2;

  // Quantity dialog
  showQuantityDialog: boolean;
  setShowQuantityDialog: (show: boolean) => void;
  handleQuantitySubmit: (mealType: MealType, quantity: number) => void;

  // Clear dialog
  clearMealPlanDialog: boolean;
  setClearMealPlanDialog: (show: boolean) => void;
  confirmClearAll: () => void;

  // Delete dialog
  deleteMealDialog: { open: boolean; recipe: any };
  setDeleteMealDialog: (dialog: { open: boolean; recipe: any }) => void;
  confirmRemoveMeal: () => void;
}

export const MealPlannerModals = ({
  addMealModal,
  setAddMealModal,
  recipes,
  onAddMealFinish,
  leftoverModal,
  setLeftoverModal,
  onLeftoverConfirm,
  showReplaceDialog,
  setShowReplaceDialog,
  handleReplaceConfirm,
  currentWeek,
  showQuantityDialog,
  setShowQuantityDialog,
  handleQuantitySubmit,
  clearMealPlanDialog,
  setClearMealPlanDialog,
  confirmClearAll,
  deleteMealDialog,
  setDeleteMealDialog,
  confirmRemoveMeal,
}: MealPlannerModalsProps) => {
  return (
    <>
      {addMealModal.open && addMealModal.mealType && (
        <AddMealPlanDialog
          isOpen={addMealModal.open}
          onClose={() => setAddMealModal({ ...addMealModal, open: false })}
          onAddMealPlan={(recipeId: string, notes: string) => onAddMealFinish(addMealModal.mealType!, recipeId)}
          recipes={recipes}
          selectedDate={new Date()}
          selectedMealType={addMealModal.mealType}
        />
      )}

      {leftoverModal.open && leftoverModal.recipe && leftoverModal.mealPlan && (
        <LeftoverServingsDialog
          open={leftoverModal.open}
          onClose={() => setLeftoverModal({ ...leftoverModal, open: false })}
          mealPlan={leftoverModal.mealPlan}
          recipe={leftoverModal.recipe}
          onConfirm={onLeftoverConfirm}
        />
      )}

      <MealPlanReplaceDialog
        open={showReplaceDialog}
        onOpenChange={setShowReplaceDialog}
        onConfirm={handleReplaceConfirm}
        weekNumber={currentWeek}
      />

      <MealQuantityDialog
        open={showQuantityDialog}
        onClose={() => setShowQuantityDialog(false)}
        onSubmit={handleQuantitySubmit}
      />

      <ClearMealPlanDialog
        open={clearMealPlanDialog}
        onOpenChange={setClearMealPlanDialog}
        onConfirm={confirmClearAll}
        weekNumber={currentWeek}
      />

      <DeleteMealDialog
        open={deleteMealDialog.open}
        onOpenChange={(open) => setDeleteMealDialog({ ...deleteMealDialog, open })}
        onConfirm={confirmRemoveMeal}
        recipe={deleteMealDialog.recipe}
      />
    </>
  );
};
