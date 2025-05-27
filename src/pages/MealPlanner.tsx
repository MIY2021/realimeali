import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { WeekSelector } from "@/components/meal-planner/WeekSelector";
import { MealPlannerActions } from "@/components/meal-planner/MealPlannerActions";
import MealListSection from "@/components/MealListSection";
import { AddMealPlanDialog } from "@/components/meal-planner/AddMealPlanDialog";
import { LeftoverServingsDialog } from "@/components/meal-planner/LeftoverServingsDialog";
import { MealPlanReplaceDialog } from "@/components/meal-planner/MealPlanReplaceDialog";
import { useMealPlanActions } from "@/hooks/useMealPlanActions";
import { useRandomMealSelection } from "@/hooks/useRandomMealSelection";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useRecipes } from "@/contexts/RecipesContext";
import { Calendar } from "lucide-react";

const MealPlanner = () => {
  useDocumentTitle("Meal Planner");
  const [currentWeek, setCurrentWeek] = useState<1 | 2>(1);
  const { getRecipeById, recipes } = useRecipes();
  
  const {
    mealTypes,
    mealTypeToCategories,
    addMealModal,
    setAddMealModal,
    leftoverModal,
    setLeftoverModal,
    getMealPlansForType,
    handleRemoveMeal,
    handleAddMeal,
    handleCreateLeftover,
    handleReorderMeals,
    onLeftoverConfirm,
    onAddMealFinish,
    handleClearAll,
    handleShareMealPlan,
  } = useMealPlanActions(currentWeek);

  const { handleRandomize, isLoading, showReplaceDialog, setShowReplaceDialog, performMealSelection } = 
    useRandomMealSelection(currentWeek);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Title with icon at the top */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-8 w-8 text-terracotta" />
            <h1 className="text-3xl font-bold text-navy">Meal Planner</h1>
          </div>
          <p className="text-muted-foreground">
            Plan your meals for the coming weeks and generate shopping lists.
          </p>
        </div>

        {/* Actions row: Generate meal plan and approval button */}
        <MealPlannerActions
          onRandomize={handleRandomize}
          isLoading={isLoading}
          currentWeek={currentWeek}
        />

        {/* Week selector with share and clear buttons */}
        <WeekSelector 
          week={currentWeek} 
          onWeekChange={setCurrentWeek}
          onShare={handleShareMealPlan}
          onClearAll={handleClearAll}
          isLoading={isLoading}
        />

        <div className="space-y-8">
          {mealTypes.map((mealType) => (
            <MealListSection
              key={mealType}
              mealType={mealType}
              mealPlans={getMealPlansForType(mealType)}
              getRecipeById={getRecipeById}
              onRemoveMeal={handleRemoveMeal}
              onAddMeal={() => handleAddMeal(mealType)}
              onCreateLeftover={handleCreateLeftover}
              onReorderMeals={handleReorderMeals}
            />
          ))}
        </div>

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
          onConfirm={performMealSelection}
          weekNumber={currentWeek}
        />
      </div>
    </Layout>
  );
};

export default MealPlanner;
