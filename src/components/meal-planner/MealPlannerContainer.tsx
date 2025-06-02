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
    reorderMealPlans,
    fetchMealPlans 
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

  const { generateRandomMeals } = useRandomMealSelection();

  // Create a wrapper function that matches the expected signature
  const generateRandomMealPlan = useCallback(async (quantities: { 
    dinner: number; 
    lunch: number; 
    breakfast: number; 
    snacks: number;
    sides: number;
    desserts: number;
    drinks: number;
  }, weekNumber: 1 | 2) => {
    let totalAdded = 0;
    
    // Generate meals for each meal type based on quantities
    for (const [mealType, count] of Object.entries(quantities)) {
      if (count > 0) {
        try {
          const added = await generateRandomMeals(weekNumber, mealType as any, count);
          totalAdded += added;
        } catch (error) {
          console.error(`Error generating ${mealType} meals:`, error);
        }
      }
    }
    
    return totalAdded;
  }, [generateRandomMeals]);

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
    refreshMealPlans: fetchMealPlans,
  });

  const currentMealPlans = getMealPlansForWeek(currentWeek);

  const handleAddMeal = useCallback((mealType: MealType) => {
    console.log("🍽️ handleAddMeal called with mealType:", mealType);
    setPendingMealType(mealType);
    
    // Special handling for lunch - show leftover servings dialog
    if (mealType === 'lunch') {
      console.log("🥪 Opening leftover dialog for lunch");
      setLeftoverDialog(true);
    } else {
      console.log("🍽️ Opening simple meal dialog for:", mealType);
      setSimpleMealDialog(true);
    }
  }, [setPendingMealType, setLeftoverDialog, setSimpleMealDialog]);

  const handleServingsConfirm = useCallback((mealType: MealType, servings: number) => {
    console.log("✅ handleServingsConfirm:", { mealType, servings });
    setAddMealModal({ open: true, mealType, date: null });
    setPendingMealType(null);
  }, [setAddMealModal, setPendingMealType]);

  const handleSimpleMealSelect = useCallback(async (recipeId: string) => {
    console.log("🎯 handleSimpleMealSelect:", { recipeId, pendingMealType });
    if (!pendingMealType) return;
    await handleAddRecipeToMeal(recipeId, pendingMealType);
    setPendingMealType(null);
    setSimpleMealDialog(false);
  }, [pendingMealType, handleAddRecipeToMeal, setPendingMealType, setSimpleMealDialog]);

  const handleLunchLeftoverConfirm = useCallback((servings: number) => {
    console.log("🥪 handleLunchLeftoverConfirm - servings:", servings);
    // For lunch additions, we'll show the recipe selection dialog with the servings info
    setLeftoverDialog(false);
    setSimpleMealDialog(true);
    // Store the servings for later use when a recipe is selected
    console.log("Lunch leftover servings selected:", servings);
  }, [setLeftoverDialog, setSimpleMealDialog]);

  const handleCreateLeftoverWithDialog = useCallback((mealPlan: MealPlan, recipe: Recipe) => {
    console.log("🔄 handleCreateLeftoverWithDialog:", { mealPlan: mealPlan.id, recipe: recipe.title });
    setPendingLeftoverData({ mealPlan, recipe });
    setPendingMealType('lunch'); // Set to lunch for leftover creation
    setLeftoverDialog(true);
  }, [setPendingLeftoverData, setPendingMealType, setLeftoverDialog]);

  const handleRandomizeClick = useCallback(() => {
    // Check if there are existing meal plans
    if (currentMealPlans.length > 0) {
      setWarningDialog(true);
    } else {
      handleRandomize();
    }
  }, [currentMealPlans.length, handleRandomize, setWarningDialog]);

  const handleWarningConfirm = useCallback(() => {
    handleRandomize();
  }, [handleRandomize]);

  const handleClearAllConfirm = useCallback(() => {
    performClearAll();
  }, [performClearAll]);

  const handleCreateLeftoverWithServings = useCallback(async (mealPlan: MealPlan, recipe: Recipe, leftoverServings: number) => {
    console.log("🔄 handleCreateLeftoverWithServings:", { leftoverServings });
    await handleCreateLeftover(mealPlan, recipe, leftoverServings);
    setPendingLeftoverData(null);
    setPendingMealType(null);
  }, [handleCreateLeftover, setPendingLeftoverData, setPendingMealType]);

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
