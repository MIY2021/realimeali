
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { WeekSelector } from "@/components/meal-planner/WeekSelector";
import { MealPlannerActions } from "@/components/meal-planner/MealPlannerActions";
import { MealListSection } from "@/components/MealListSection";
import { AddMealPlanDialog } from "@/components/meal-planner/AddMealPlanDialog";
import { LeftoverServingsDialog } from "@/components/meal-planner/LeftoverServingsDialog";
import { MealPlanReplaceDialog } from "@/components/meal-planner/MealPlanReplaceDialog";
import { useMealPlanActions } from "@/hooks/useMealPlanActions";
import { useRandomMealSelection } from "@/hooks/useRandomMealSelection";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const MealPlanner = () => {
  useDocumentTitle("Meal Planner");
  const [currentWeek, setCurrentWeek] = useState<1 | 2>(1);
  
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

  const { handleRandomize, isLoading, showReplaceDialog, setShowReplaceDialog } = 
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
              onRemoveMeal={handleRemoveMeal}
              onAddMeal={() => handleAddMeal(mealType)}
              onCreateLeftover={handleCreateLeftover}
              onReorderMeals={handleReorderMeals}
            />
          ))}
        </div>

        <AddMealPlanDialog
          open={addMealModal.open}
          onOpenChange={(open) => setAddMealModal({ ...addMealModal, open })}
          mealType={addMealModal.mealType}
          categories={addMealModal.mealType ? mealTypeToCategories[addMealModal.mealType] : []}
          onFinish={onAddMealFinish}
        />

        <LeftoverServingsDialog
          open={leftoverModal.open}
          onOpenChange={(open) => setLeftoverModal({ ...leftoverModal, open })}
          recipe={leftoverModal.recipe}
          onConfirm={onLeftoverConfirm}
        />

        <MealPlanReplaceDialog
          open={showReplaceDialog}
          onOpenChange={setShowReplaceDialog}
          onConfirm={handleRandomize}
          weekNumber={currentWeek}
        />
      </div>
    </Layout>
  );
};

export default MealPlanner;
