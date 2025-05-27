
import { useState } from "react";
import { WeekSelector } from "@/components/meal-planner/WeekSelector";
import { MealPlannerActions } from "@/components/meal-planner/MealPlannerActions";
import { MealPlannerDragAndDrop } from "@/components/meal-planner/MealPlannerDragAndDrop";
import { MealPlannerModals } from "@/components/meal-planner/MealPlannerModals";
import { useMealPlanActions } from "@/hooks/useMealPlanActions";
import { useRandomMealSelection } from "@/hooks/useRandomMealSelection";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useRecipes } from "@/contexts/RecipesContext";
import { Calendar } from "lucide-react";
import { DropResult } from "react-beautiful-dnd";
import { MealType } from "@/types";

const MealPlanner = () => {
  useDocumentTitle("Meal Planner");
  const [currentWeek, setCurrentWeek] = useState<1 | 2>(1);
  const [isDraggingCategory, setIsDraggingCategory] = useState(false);
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);
  const { getRecipeById, recipes } = useRecipes();
  
  const {
    mealTypes,
    setMealTypes,
    addMealModal,
    setAddMealModal,
    leftoverModal,
    setLeftoverModal,
    clearMealPlanDialog,
    setClearMealPlanDialog,
    deleteMealDialog,
    setDeleteMealDialog,
    getMealPlansForType,
    handleRemoveMeal,
    confirmRemoveMeal,
    handleAddMeal,
    handleCreateLeftover,
    handleReorderMeals,
    onLeftoverConfirm,
    onAddMealFinish,
    handleClearAll,
    confirmClearAll,
    handleShareMealPlan,
  } = useMealPlanActions(currentWeek);

  const { 
    handleRandomize, 
    isLoading, 
    showReplaceDialog, 
    setShowReplaceDialog, 
    showQuantityDialog,
    setShowQuantityDialog,
    handleReplaceConfirm,
    handleQuantityConfirm
  } = useRandomMealSelection(currentWeek);

  const handleMealTypeDragStart = (result: any) => {
    setIsDraggingCategory(true);
    setDraggedCategoryId(result.draggableId);
  };

  const handleMealTypeDragEnd = (result: DropResult) => {
    setIsDraggingCategory(false);
    setDraggedCategoryId(null);
    
    if (!result.destination) return;

    const items = Array.from(mealTypes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setMealTypes(items);
  };

  return (
    <div className="container max-w-7xl py-4 px-4 sm:py-8 sm:px-6">
      {/* Title with icon */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy flex items-center gap-2">
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-terracotta" />
            <span>Meal Planner</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Plan your meals for the coming weeks and generate shopping lists.
          </p>
        </div>
      </div>

      {/* Actions row: Generate meal plan, share and clear buttons */}
      <MealPlannerActions
        onRandomize={handleRandomize}
        onShare={handleShareMealPlan}
        onClearAll={handleClearAll}
        isLoading={isLoading}
        currentWeek={currentWeek}
      />

      {/* Week selector */}
      <WeekSelector 
        week={currentWeek} 
        onWeekChange={setCurrentWeek}
        isLoading={isLoading}
      />

      <MealPlannerDragAndDrop
        mealTypes={mealTypes}
        isDraggingCategory={isDraggingCategory}
        draggedCategoryId={draggedCategoryId}
        onDragStart={handleMealTypeDragStart}
        onDragEnd={handleMealTypeDragEnd}
        getMealPlansForType={getMealPlansForType}
        getRecipeById={getRecipeById}
        onRemoveMeal={handleRemoveMeal}
        onAddMeal={handleAddMeal}
        onCreateLeftover={handleCreateLeftover}
        onReorderMeals={handleReorderMeals}
      />

      <MealPlannerModals
        addMealModal={addMealModal}
        setAddMealModal={setAddMealModal}
        recipes={recipes}
        onAddMealFinish={onAddMealFinish}
        leftoverModal={leftoverModal}
        setLeftoverModal={setLeftoverModal}
        onLeftoverConfirm={onLeftoverConfirm}
        showReplaceDialog={showReplaceDialog}
        setShowReplaceDialog={setShowReplaceDialog}
        handleReplaceConfirm={handleReplaceConfirm}
        currentWeek={currentWeek}
        showQuantityDialog={showQuantityDialog}
        setShowQuantityDialog={setShowQuantityDialog}
        handleQuantityConfirm={handleQuantityConfirm}
        clearMealPlanDialog={clearMealPlanDialog}
        setClearMealPlanDialog={setClearMealPlanDialog}
        confirmClearAll={confirmClearAll}
        deleteMealDialog={deleteMealDialog}
        setDeleteMealDialog={setDeleteMealDialog}
        confirmRemoveMeal={confirmRemoveMeal}
      />
    </div>
  );
};

export default MealPlanner;
