
import { MealPlanQuantitiesDialog } from "@/components/meal-planner/MealPlanQuantitiesDialog";
import { SimpleMealSelectionDialog } from "@/components/meal-planner/SimpleMealSelectionDialog";
import { LeftoverServingsDialog } from "@/components/meal-planner/LeftoverServingsDialog";
import { MealPlanWarningDialog } from "@/components/meal-planner/MealPlanWarningDialog";
import { ClearAllMealsDialog } from "@/components/meal-planner/ClearAllMealsDialog";
import { MealServingsDialog } from "@/components/meal-planner/MealServingsDialog";
import { Recipe, MealType } from "@/types";

interface MealPlannerModalsContainerProps {
  quantitiesDialog: boolean;
  setQuantitiesDialog: (open: boolean) => void;
  simpleMealDialog: boolean;
  setSimpleMealDialog: (open: boolean) => void;
  leftoverDialog: boolean;
  setLeftoverDialog: (open: boolean) => void;
  warningDialog: boolean;
  setWarningDialog: (open: boolean) => void;
  clearAllDialog: boolean;
  setClearAllDialog: (open: boolean) => void;
  servingsDialog: boolean;
  setServingsDialog: (open: boolean) => void;
  pendingMealType: MealType | null;
  setPendingMealType: (mealType: MealType | null) => void;
  pendingLeftoverData: { mealPlan: any; recipe: any } | null;
  recipes: Recipe[];
  currentWeek: 1 | 2;
  onRandomizeWithQuantities: (quantities: any) => void;
  onSimpleMealSelect: (recipeId: string) => void;
  onAddFreetypeMeal: (mealName: string) => void;
  onLunchLeftoverConfirm: (servings: number) => void;
  onCreateLeftover: (mealPlan: any, recipe: any, leftoverServings: number) => void;
  onWarningConfirm: () => void;
  onClearAllConfirm: () => void;
  onServingsConfirm: (mealType: MealType, servings: number) => void;
}

export const MealPlannerModalsContainer = ({
  quantitiesDialog,
  setQuantitiesDialog,
  simpleMealDialog,
  setSimpleMealDialog,
  leftoverDialog,
  setLeftoverDialog,
  warningDialog,
  setWarningDialog,
  clearAllDialog,
  setClearAllDialog,
  servingsDialog,
  setServingsDialog,
  pendingMealType,
  setPendingMealType,
  pendingLeftoverData,
  recipes,
  currentWeek,
  onRandomizeWithQuantities,
  onSimpleMealSelect,
  onAddFreetypeMeal,
  onLunchLeftoverConfirm,
  onCreateLeftover,
  onWarningConfirm,
  onClearAllConfirm,
  onServingsConfirm,
}: MealPlannerModalsContainerProps) => {
  
  console.log("🎭 MealPlannerModalsContainer render:", {
    leftoverDialog,
    pendingMealType,
    isNewLunchMeal: pendingMealType === 'lunch' && !pendingLeftoverData,
    hasPendingLeftoverData: !!pendingLeftoverData
  });

  // Determine if this is a new lunch meal (no leftover data) vs creating leftovers (has leftover data)
  const isNewLunchMeal = pendingMealType === 'lunch' && !pendingLeftoverData;

  return (
    <>
      <MealPlanQuantitiesDialog
        isOpen={quantitiesDialog}
        onClose={() => setQuantitiesDialog(false)}
        onConfirm={onRandomizeWithQuantities}
        availableRecipes={recipes.length}
      />

      <SimpleMealSelectionDialog
        open={simpleMealDialog}
        onClose={() => {
          setSimpleMealDialog(false);
          setPendingMealType(null);
        }}
        mealType={pendingMealType || "dinner"}
        recipes={recipes}
        onSelectRecipe={onSimpleMealSelect}
        onAddFreetypeMeal={onAddFreetypeMeal}
      />

      <LeftoverServingsDialog
        open={leftoverDialog}
        onClose={() => {
          setLeftoverDialog(false);
          setPendingMealType(null);
          // Don't clear pendingLeftoverData here to allow proper debugging
        }}
        mealPlan={pendingLeftoverData?.mealPlan || null}
        recipe={pendingLeftoverData?.recipe || null}
        onConfirm={onLunchLeftoverConfirm}
        isNewLunchMeal={isNewLunchMeal}
        onCreateLeftover={onCreateLeftover}
      />

      <MealPlanWarningDialog
        open={warningDialog}
        onOpenChange={setWarningDialog}
        onConfirm={onWarningConfirm}
        weekNumber={currentWeek}
      />

      <ClearAllMealsDialog
        open={clearAllDialog}
        onOpenChange={setClearAllDialog}
        onConfirm={onClearAllConfirm}
        weekNumber={currentWeek}
      />

      {pendingMealType && (
        <MealServingsDialog
          isOpen={servingsDialog}
          onClose={() => {
            setServingsDialog(false);
            setPendingMealType(null);
          }}
          onConfirm={onServingsConfirm}
          mealType={pendingMealType}
        />
      )}
    </>
  );
};
