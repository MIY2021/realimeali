
import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useRecipesLoader } from "@/hooks/useRecipesLoader";
import { MealPlannerHeader } from "@/components/meal-planner/MealPlannerHeader";
import { MealPlannerContent } from "@/components/meal-planner/MealPlannerContent";
import { MealPlannerModalsContainer } from "@/components/meal-planner/MealPlannerModalsContainer";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useMealPlanModals } from "@/hooks/useMealPlanModals";
import { useRandomMealSelection } from "@/hooks/useRandomMealSelection";
import { useMealPlannerOperations } from "@/hooks/useMealPlannerOperations";
import { useMealPlannerState } from "@/hooks/useMealPlannerState";
import { MealType, Recipe, MealPlan } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function MealPlannerContainer() {
  useDocumentTitle("Meal Planner | RealiMeali");
  
  const { user } = useAuth();
  const { recipes, isLoading: recipesLoading } = useRecipes();
  const { currentHousehold } = useHousehold();
  const { 
    getMealPlansForWeek, 
    addMealPlan, 
    removeMealPlan, 
    clearWeek, 
    reorderMealPlans 
  } = useMealPlan();
  const { toast } = useToast();
  
  // Auto-load recipes when component mounts
  useRecipesLoader();
  
  const {
    currentWeek,
    setCurrentWeek,
    isLoading,
    setIsLoading,
    quantitiesDialog,
    setQuantitiesDialog,
    servingsDialog,
    setServingsDialog,
    simpleMealDialog,
    setSimpleMealDialog,
    leftoverDialog,
    setLeftoverDialog,
    warningDialog,
    setWarningDialog,
    clearAllDialog,
    setClearAllDialog,
    pendingMealType,
    setPendingMealType,
    pendingLeftoverData,
    setPendingLeftoverData,
  } = useMealPlannerState();
  
  const {
    addMealModal,
    setAddMealModal,
  } = useMealPlanModals();

  const { generateRandomMealPlan } = useRandomMealSelection();

  const {
    handleAddRecipeToMeal,
    handleRemoveMeal,
    handleCreateLeftover,
    handleReorderMeals,
    handleRandomize,
    handleRandomizeWithQuantities,
    handleShare,
    handleClearAll,
    performClearAll,
  } = useMealPlannerOperations({
    user,
    currentHousehold,
    recipes,
    currentWeek,
    addMealPlan,
    removeMealPlan,
    clearWeek,
    reorderMealPlans,
    generateRandomMealPlan,
    setAddMealModal,
    setIsLoading,
    toast,
    setQuantitiesDialog,
    setServingsDialog,
    setPendingMealType,
    setClearAllDialog,
  });

  const currentMealPlans = getMealPlansForWeek(currentWeek);

  const handleAddMeal = useCallback((mealType: MealType) => {
    setPendingMealType(mealType);
    
    // Special handling for lunch - show leftover servings dialog
    if (mealType === 'lunch') {
      setLeftoverDialog(true);
    } else {
      setSimpleMealDialog(true);
    }
  }, []);

  const handleServingsConfirm = useCallback((mealType: MealType, servings: number) => {
    setAddMealModal({ open: true, mealType, date: null });
    setPendingMealType(null);
  }, [setAddMealModal, setPendingMealType]);

  const handleSimpleMealSelect = useCallback(async (recipeId: string) => {
    if (!pendingMealType) return;
    await handleAddRecipeToMeal(recipeId, pendingMealType);
    setPendingMealType(null);
  }, [pendingMealType, handleAddRecipeToMeal]);

  const handleLunchLeftoverConfirm = useCallback((servings: number) => {
    // For lunch additions, we'll show the recipe selection dialog with the servings info
    setLeftoverDialog(false);
    setSimpleMealDialog(true);
    // Store the servings for later use when a recipe is selected
    console.log("Lunch leftover servings selected:", servings);
  }, []);

  const handleCreateLeftoverWithDialog = useCallback((mealPlan: MealPlan, recipe: Recipe) => {
    setPendingLeftoverData({ mealPlan, recipe });
    setLeftoverDialog(true);
  }, []);

  const handleRandomizeClick = useCallback(() => {
    // Check if there are existing meal plans
    if (currentMealPlans.length > 0) {
      setWarningDialog(true);
    } else {
      handleRandomize();
    }
  }, [currentMealPlans.length, handleRandomize]);

  const handleWarningConfirm = useCallback(() => {
    handleRandomize();
  }, [handleRandomize]);

  const handleClearAllConfirm = useCallback(() => {
    performClearAll();
  }, [performClearAll]);

  const handleCreateLeftoverWithServings = useCallback(async (mealPlan: MealPlan, recipe: Recipe, leftoverServings: number) => {
    await handleCreateLeftover(mealPlan, recipe, leftoverServings);
    setPendingLeftoverData(null);
  }, [handleCreateLeftover]);

  if (!user || !currentHousehold) {
    return (
      <div className="container max-w-4xl py-4 px-4 sm:py-8 sm:px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-navy mb-4">Meal Planner</h1>
          <p className="text-muted-foreground">Please log in and select a household to start meal planning.</p>
        </div>
      </div>
    );
  }

  if (recipesLoading) {
    return (
      <div className="container max-w-4xl py-4 px-4 sm:py-8 sm:px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-navy mb-4">Meal Planner</h1>
          <p className="text-muted-foreground">Loading your recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-4 px-4 sm:py-8 sm:px-6 space-y-8">
      <MealPlannerHeader
        user={user}
        currentHousehold={currentHousehold}
      />

      <MealPlannerContent
        currentWeek={currentWeek}
        setCurrentWeek={setCurrentWeek}
        isLoading={isLoading}
        currentMealPlans={currentMealPlans}
        recipes={recipes}
        onRandomize={handleRandomizeClick}
        onShare={handleShare}
        onClearAll={handleClearAll}
        onAddMeal={handleAddMeal}
        onRemoveMeal={handleRemoveMeal}
        onCreateLeftover={handleCreateLeftoverWithDialog}
        onReorderMeals={handleReorderMeals}
      />

      <MealPlannerModalsContainer
        quantitiesDialog={quantitiesDialog}
        setQuantitiesDialog={setQuantitiesDialog}
        simpleMealDialog={simpleMealDialog}
        setSimpleMealDialog={setSimpleMealDialog}
        leftoverDialog={leftoverDialog}
        setLeftoverDialog={setLeftoverDialog}
        warningDialog={warningDialog}
        setWarningDialog={setWarningDialog}
        clearAllDialog={clearAllDialog}
        setClearAllDialog={setClearAllDialog}
        servingsDialog={servingsDialog}
        setServingsDialog={setServingsDialog}
        pendingMealType={pendingMealType}
        setPendingMealType={setPendingMealType}
        pendingLeftoverData={pendingLeftoverData}
        recipes={recipes}
        currentWeek={currentWeek}
        onRandomizeWithQuantities={handleRandomizeWithQuantities}
        onSimpleMealSelect={handleSimpleMealSelect}
        onLunchLeftoverConfirm={handleLunchLeftoverConfirm}
        onCreateLeftover={handleCreateLeftoverWithServings}
        onWarningConfirm={handleWarningConfirm}
        onClearAllConfirm={handleClearAllConfirm}
        onServingsConfirm={handleServingsConfirm}
      />
    </div>
  );
}
