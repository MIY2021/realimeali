
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useRecipesLoader } from "@/hooks/useRecipesLoader";
import { MealPlannerHeader } from "@/components/meal-planner/MealPlannerHeader";
import { MealPlannerActions } from "@/components/meal-planner/MealPlannerActions";
import { WeekSelector } from "@/components/meal-planner/WeekSelector";
import { SimpleMealSelectionDialog } from "@/components/meal-planner/SimpleMealSelectionDialog";
import { MealPlanQuantitiesDialog } from "@/components/meal-planner/MealPlanQuantitiesDialog";
import { MealServingsDialog } from "@/components/meal-planner/MealServingsDialog";
import { LeftoverServingsDialog } from "@/components/meal-planner/LeftoverServingsDialog";
import { MealPlanWarningDialog } from "@/components/meal-planner/MealPlanWarningDialog";
import { ClearAllMealsDialog } from "@/components/meal-planner/ClearAllMealsDialog";
import MealListSection from "@/components/MealListSection";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useMealPlanModals } from "@/hooks/useMealPlanModals";
import { useRandomMealSelection } from "@/hooks/useRandomMealSelection";
import { useMealPlannerOperations } from "@/hooks/useMealPlannerOperations";
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
  
  const [currentWeek, setCurrentWeek] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [quantitiesDialog, setQuantitiesDialog] = useState(false);
  const [servingsDialog, setServingsDialog] = useState(false);
  const [simpleMealDialog, setSimpleMealDialog] = useState(false);
  const [leftoverDialog, setLeftoverDialog] = useState(false);
  const [warningDialog, setWarningDialog] = useState(false);
  const [clearAllDialog, setClearAllDialog] = useState(false);
  const [pendingMealType, setPendingMealType] = useState<MealType | null>(null);
  
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
  const mealTypes: MealType[] = ["dinner", "lunch", "breakfast", "snacks", "sides", "desserts", "drinks"];

  const getMealPlansForType = useCallback((mealType: MealType): MealPlan[] => {
    return currentMealPlans
      .filter(plan => plan.meal_type === mealType)
      .sort((a, b) => (a.slot_index || 0) - (b.slot_index || 0));
  }, [currentMealPlans]);

  const getRecipeById = useCallback((id: string): Recipe | undefined => {
    return recipes.find(recipe => recipe.id === id);
  }, [recipes]);

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

      <MealPlannerActions
        onRandomize={handleRandomizeClick}
        onShare={handleShare}
        onClearAll={handleClearAll}
        isLoading={isLoading}
        currentWeek={currentWeek}
      />

      <WeekSelector
        week={currentWeek}
        onWeekChange={setCurrentWeek}
        isLoading={isLoading}
      />

      <div className="space-y-6">
        {mealTypes.map((mealType) => (
          <MealListSection
            key={mealType}
            mealType={mealType}
            mealPlans={getMealPlansForType(mealType)}
            getRecipeById={getRecipeById}
            onAddMeal={handleAddMeal}
            onRemoveMeal={handleRemoveMeal}
            onCreateLeftover={handleCreateLeftover}
            onReorderMeals={handleReorderMeals}
          />
        ))}
      </div>

      <MealPlanQuantitiesDialog
        isOpen={quantitiesDialog}
        onClose={() => setQuantitiesDialog(false)}
        onConfirm={handleRandomizeWithQuantities}
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
        onSelectRecipe={handleSimpleMealSelect}
      />

      <LeftoverServingsDialog
        open={leftoverDialog}
        onClose={() => {
          setLeftoverDialog(false);
          setPendingMealType(null);
        }}
        mealPlan={null}
        recipe={null}
        onConfirm={handleLunchLeftoverConfirm}
        isNewLunchMeal={pendingMealType === 'lunch'}
      />

      <MealPlanWarningDialog
        open={warningDialog}
        onOpenChange={setWarningDialog}
        onConfirm={handleWarningConfirm}
        weekNumber={currentWeek}
      />

      <ClearAllMealsDialog
        open={clearAllDialog}
        onOpenChange={setClearAllDialog}
        onConfirm={handleClearAllConfirm}
        weekNumber={currentWeek}
      />

      {pendingMealType && (
        <MealServingsDialog
          isOpen={servingsDialog}
          onClose={() => {
            setServingsDialog(false);
            setPendingMealType(null);
          }}
          onConfirm={handleServingsConfirm}
          mealType={pendingMealType}
        />
      )}
    </div>
  );
}
