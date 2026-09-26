import { useCallback, useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";

import { MealPlannerHeader } from "@/components/meal-planner/MealPlannerHeader";
import { MealPlannerContent } from "@/components/meal-planner/MealPlannerContent";
import { MealPlannerModalsContainer } from "@/components/meal-planner/MealPlannerModalsContainer";
import { MealPlannerActions } from "@/components/meal-planner/MealPlannerActions";
import { CustomMealDialog } from "@/components/meal-planner/CustomMealDialog";
import { MealPlanInfoDialog } from "@/components/meal-planner/MealPlanInfoDialog";
import MealPlannerSkeleton from "@/components/meal-planner/MealPlannerSkeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useMealPlanModals } from "@/hooks/useMealPlanModals";
import { useRandomMealSelection } from "@/hooks/useRandomMealSelection";
import { useMealPlannerOperations } from "@/hooks/useMealPlannerOperations";
import { useMealPlannerState } from "@/hooks/useMealPlannerState";
import { useMealPlannerLayout } from "@/hooks/useMealPlannerLayout";
import { MealType, Recipe, MealPlan } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { parseISOWeekKey, getWeekStartDate, formatLocalDateYMD } from "@/utils/weekUtils";

export default function MealPlannerContainer() {
  useDocumentTitle("Meal Planner | RealiMeali");
  
  const { user } = useAuth();
  const { recipes, isLoading: recipesLoading } = useRecipes();
  const { currentHousehold } = useHousehold();
  const { 
    mealPlans,
    getMealPlansForWeek, 
    addMealPlan, 
    removeMealPlan, 
    clearWeek,
    copyWeek,
    reorderMealPlans,
    fetchMealPlans,
    isLoading: mealPlansLoading
  } = useMealPlan();
  const { toast } = useToast();

  // Handle initial loading - show content immediately when data is available
  const isDataLoading = !user || !currentHousehold || recipesLoading || mealPlansLoading;
  
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
    mealLayout,
    handleMealLayoutChange,
  } = useMealPlannerLayout();
  
  const {
    addMealModal,
    setAddMealModal,
  } = useMealPlanModals();

  // Custom meal dialog state
  const [customMealDialog, setCustomMealDialog] = useState(false);
  const [customMealType, setCustomMealType] = useState<MealType | null>(null);
  
  // Info dialog state
  const [infoDialog, setInfoDialog] = useState(false);
  const [mealPlanGenerationMode, setMealPlanGenerationMode] = useState<"replace" | "add">("replace");

  const { generateRandomMeals } = useRandomMealSelection();

  const currentMealPlans = getMealPlansForWeek(currentWeek);

  // Create a wrapper function that matches the expected signature
  const generateRandomMealPlan = useCallback(async (quantities: { 
    dinner: number; 
    lunch: number; 
    breakfast: number; 
    snacks: number;
    sides: number;
    desserts: number;
    drinks: number;
  }, weekKey: string) => {
    let totalAdded = 0;
    
    // Generate meals for each meal type based on quantities
    for (const [mealType, count] of Object.entries(quantities)) {
      if (count > 0) {
        try {
          const added = await generateRandomMeals(weekKey, mealType as any, count);
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
    currentMealPlans,
  });

  const handleAddMeal = useCallback((mealType: MealType) => {
    console.log("🍽️ handleAddMeal called with mealType:", mealType);
    setPendingMealType(mealType);
    setSimpleMealDialog(true);
  }, [setPendingMealType, setSimpleMealDialog]);

  const handleAddCustomMeal = useCallback((mealType: MealType) => {
    console.log("🍽️ handleAddCustomMeal called with mealType:", mealType);
    setCustomMealType(mealType);
    setCustomMealDialog(true);
  }, []);

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

  const handleAddFreetypeMeal = useCallback(async (mealName: string, servings: number = 1) => {
    console.log("🍽️ handleAddFreetypeMeal:", { mealName, servings, pendingMealType });
    if (!pendingMealType || !user || !currentHousehold) return;

    try {
      const mealPlanData = {
        date: (() => { const { year, week } = parseISOWeekKey(currentWeek); return formatLocalDateYMD(getWeekStartDate(year, week)); })(),
        meal_type: pendingMealType,
        created_by: user.id,
        slot_index: 0,
        is_leftover: false,
        household_id: currentHousehold.id,
        week_key: currentWeek,
        original_servings: servings,
        planned_servings: servings,
        is_completed: false,
        is_freetyped: true,
        meal_name: mealName,
      };

      await addMealPlan(mealPlanData, currentWeek);
      setPendingMealType(null);
      setSimpleMealDialog(false);
      
      toast({
        title: "Custom Meal Added",
        description: `${mealName} has been added to ${pendingMealType}`,
      });
    } catch (err) {
      console.error("Error adding freetype meal:", err);
      toast({
        title: "Error",
        description: "Failed to add custom meal",
        variant: "destructive",
      });
    }
  }, [pendingMealType, user, currentHousehold, currentWeek, addMealPlan, setPendingMealType, setSimpleMealDialog, toast]);

  const handleLunchLeftoverConfirm = useCallback((servings: number) => {
    console.log("🥪 handleLunchLeftoverConfirm - servings:", servings);
    // For lunch additions, we'll show the recipe selection dialog with the servings info
    setLeftoverDialog(false);
    setSimpleMealDialog(true);
    // Store the servings for later use when a recipe is selected
    console.log("Lunch leftover servings selected:", servings);
  }, [setLeftoverDialog, setSimpleMealDialog]);

  const handleCreateLeftoverWithDialog = useCallback((mealPlan: MealPlan, recipe?: Recipe) => {
    const mealName = recipe?.title || mealPlan.meal_name || 'Custom Meal';
    console.log("🔄 handleCreateLeftoverWithDialog:", { mealPlan: mealPlan.id, mealName });
    setPendingLeftoverData({ mealPlan, recipe });
    setPendingMealType('lunch'); // Set to lunch for leftover creation
    setLeftoverDialog(true);
  }, [setPendingLeftoverData, setPendingMealType, setLeftoverDialog]);

  const handleRandomizeClick = useCallback(() => {
    // Always ask whether generated meals should replace or be added to the plan.
    setWarningDialog(true);
  }, [setWarningDialog]);

  const handleGenerationChoice = useCallback((mode: "replace" | "add") => {
    setMealPlanGenerationMode(mode);
    setWarningDialog(false);
    handleRandomize();
  }, [handleRandomize, setWarningDialog]);

  const handleRandomizeWithQuantitiesForMode = useCallback((quantities: any) => {
    return handleRandomizeWithQuantities(quantities, mealPlanGenerationMode === "replace");
  }, [handleRandomizeWithQuantities, mealPlanGenerationMode]);

  const handleClearAllConfirm = useCallback(() => {
    performClearAll();
  }, [performClearAll]);

  const handleCreateLeftoverWithServings = useCallback(async (mealPlan: MealPlan, recipe: Recipe | undefined, leftoverServings: number) => {
    console.log("🔄 handleCreateLeftoverWithServings:", { leftoverServings });
    await handleCreateLeftover(mealPlan, recipe, leftoverServings);
    setPendingLeftoverData(null);
    setPendingMealType(null);
  }, [handleCreateLeftover, setPendingLeftoverData, setPendingMealType]);

  const handleCustomMealSubmit = useCallback(async (mealName: string, servings: number, imageUrl?: string) => {
    console.log("🍽️ handleCustomMealSubmit:", { mealName, servings, customMealType });
    if (!customMealType || !user || !currentHousehold) return;

    try {
      const mealPlanData = {
        date: (() => { const { year, week } = parseISOWeekKey(currentWeek); return formatLocalDateYMD(getWeekStartDate(year, week)); })(),
        meal_type: customMealType,
        created_by: user.id,
        slot_index: 0,
        is_leftover: false,
        household_id: currentHousehold.id,
        week_key: currentWeek,
        original_servings: servings,
        planned_servings: servings,
        is_completed: false,
        is_freetyped: true,
        meal_name: mealName,
      };

      await addMealPlan(mealPlanData, currentWeek);
      setCustomMealDialog(false);
      setCustomMealType(null);
      
      toast({
        title: "Custom Meal Added",
        description: `${mealName} has been added to ${customMealType}`,
      });

      // Add to shopping list
      // The shopping list logic will handle this automatically based on the meal plan
      
    } catch (err) {
      console.error("Error adding custom meal:", err);
      toast({
        title: "Error",
        description: "Failed to add custom meal",
        variant: "destructive",
      });
    }
  }, [customMealType, user, currentHousehold, currentWeek, addMealPlan, toast]);

  // Get creation info from meal plans
  const getCreationInfo = () => {
    if (currentMealPlans.length === 0) return { lastGenerated: null, createdByUserId: undefined };
    
    // Get the most recent meal plan's creation date
    const mostRecent = currentMealPlans.reduce((latest, current) => {
      const currentTime = new Date(current.created_at || '').getTime();
      const latestTime = new Date(latest.created_at || '').getTime();
      return currentTime > latestTime ? current : latest;
    });
    
    return {
      lastGenerated: mostRecent.created_at ? new Date(mostRecent.created_at) : null,
      createdByUserId: mostRecent.created_by
    };
  };

  const { lastGenerated, createdByUserId } = getCreationInfo();

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

  return (
    <div className="container max-w-4xl py-4 px-4 sm:py-8 sm:px-6 space-y-3 min-h-screen" style={{ scrollbarGutter: 'stable' }}>
      <MealPlannerHeader
        user={user}
        currentHousehold={currentHousehold}
        onInfoClick={() => setInfoDialog(true)}
      />

      <MealPlannerActions
        onRandomize={handleRandomizeClick}
        onShare={handleShare}
        onClearAll={handleClearAll}
        isLoading={isLoading || isDataLoading}
        currentWeek={currentWeek}
        setCurrentWeek={setCurrentWeek}
        mealLayout={mealLayout}
        onMealLayoutChange={handleMealLayoutChange}
        allMealPlans={isDataLoading ? [] : mealPlans}
        copyWeek={copyWeek}
      />

      <MealPlannerContent
        currentWeek={currentWeek}
        setCurrentWeek={setCurrentWeek}
        isLoading={isLoading}
        isDataLoading={isDataLoading}
        currentMealPlans={isDataLoading ? [] : currentMealPlans}
        allMealPlans={isDataLoading ? [] : mealPlans}
        recipes={isDataLoading ? [] : recipes}
        mealLayout={mealLayout}
        onMealLayoutChange={handleMealLayoutChange}
        onRandomize={handleRandomizeClick}
        onShare={handleShare}
        onClearAll={handleClearAll}
        onAddMeal={handleAddMeal}
        onAddCustomMeal={handleAddCustomMeal}
        onRemoveMeal={handleRemoveMeal}
        onCreateLeftover={handleCreateLeftoverWithDialog}
        onReorderMeals={handleReorderMeals}
        copyWeek={copyWeek}
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
        onRandomizeWithQuantities={handleRandomizeWithQuantitiesForMode}
        onSimpleMealSelect={handleSimpleMealSelect}
        onAddFreetypeMeal={handleAddFreetypeMeal}
        onLunchLeftoverConfirm={handleLunchLeftoverConfirm}
        onCreateLeftover={handleCreateLeftoverWithServings}
        onWarningReplace={() => handleGenerationChoice("replace")}
        onWarningAdd={() => handleGenerationChoice("add")}
        onClearAllConfirm={handleClearAllConfirm}
        onServingsConfirm={handleServingsConfirm}
      />

      <CustomMealDialog
        open={customMealDialog}
        onClose={() => {
          setCustomMealDialog(false);
          setCustomMealType(null);
        }}
        mealType={customMealType || "dinner"}
        onAddCustomMeal={handleCustomMealSubmit}
      />

      <MealPlanInfoDialog
        open={infoDialog}
        onOpenChange={setInfoDialog}
        lastGenerated={lastGenerated}
        createdByUserId={createdByUserId}
      />
    </div>
  );
}
