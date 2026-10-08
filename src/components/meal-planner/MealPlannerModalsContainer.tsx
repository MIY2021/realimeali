import { MealPlanQuantitiesDialog } from "@/components/meal-planner/MealPlanQuantitiesDialog";
import { MealPlannerRecipeSelection } from "@/components/meal-planner/MealPlannerRecipeSelection";
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
  pendingLeftoverData: { mealPlan: any; recipe?: any } | null;
  recipes: Recipe[];
  currentWeek: string;
  generationMode: MealPlanGenerationMode;
  onConfirmGeneratedMeals: (meals: GeneratedMeal[], mode: MealPlanGenerationMode) => void;
  onSimpleMealSelect: (recipeId: string) => void;
  onAddFreetypeMeal: (mealName: string, servings: number) => void;
  onLunchLeftoverConfirm: (servings: number) => void;
  onCreateLeftover: (mealPlan: any, recipe?: any, leftoverServings?: number) => void;
  onWarningReplace: () => void;
  onWarningAdd: () => void;
  onClearAllConfirm: () => void;
  onServingsConfirm: (mealType: MealType, servings: number) => void;
  onChooseMeals: () => void;
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
  generationMode,
  onConfirmGeneratedMeals,
  onSimpleMealSelect,
  onAddFreetypeMeal,
  onLunchLeftoverConfirm,
  onCreateLeftover,
  onWarningReplace,
  onWarningAdd,
  onClearAllConfirm,
  onServingsConfirm,
  onChooseMeals,
}: MealPlannerModalsContainerProps) => {
  const isNewLunchMeal = pendingMealType === "lunch" && !pendingLeftoverData;

  return (
    <>
      <MealPlanQuantitiesDialog
        isOpen={quantitiesDialog}
        onClose={() => setQuantitiesDialog(false)}
        onConfirm={onConfirmGeneratedMeals}
        availableRecipes={recipes.length}
        recipes={recipes}
        currentMealCount={generationMode === "add" ? 0 : undefined}
      />

      <MealPlannerRecipeSelection
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
        onReplace={onWarningReplace}
        onAdd={onWarningAdd}
      />

      <ClearAllMealsDialog
        open={clearAllDialog}
        onOpenChange={setClearAllDialog}
        onConfirm={onClearAllConfirm}
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