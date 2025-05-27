
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

const MealPlanner = () => {
  useDocumentTitle("Meal Planner");
  const [currentWeek, setCurrentWeek] = useState<1 | 2>(1);
  const { getRecipeById } = useRecipes();
  
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Meal Planner</h1>
          <p className="text-muted-foreground">
            Plan your meals for the coming weeks and generate shopping lists.
          </p>
        </div>

        <WeekSelector 
          week={currentWeek} 
          onWeekChange={setCurrentWeek}
          onShare={handleShareMealPlan}
          onClearAll={handleClearAll}
          isLoading={isLoading}
        />

        <MealPlannerActions
          onRandomize={() => setShowReplaceDialog(true)}
          isLoading={isLoading}
          currentWeek={currentWeek}
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

        {addMealModal.open && (
          <AddMealPlanDialog
            mealType={addMealModal.mealType}
            categories={addMealModal.mealType ? mealTypeToCategories[addMealModal.mealType] : []}
            onClose={() => setAddMealModal({ ...addMealModal, open: false })}
            onFinish={onAddMealFinish}
          />
        )}

        {leftoverModal.open && leftoverModal.recipe && (
          <LeftoverServingsDialog
            recipe={leftoverModal.recipe}
            onClose={() => setLeftoverModal({ ...leftoverModal, open: false })}
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
