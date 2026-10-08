import { useCallback, useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";

import { MealPlannerHeader } from "@/components/meal-planner/MealPlannerHeader";
import { MealPlannerContent } from "@/components/meal-planner/MealPlannerContent";
import { MealPlannerModalsContainer } from "@/components/meal-planner/MealPlannerModalsContainer";
import { MealPlannerActions } from "@/components/meal-planner/MealPlannerActions";
import { RecipeSwipeDialog } from "@/components/dashboard/RecipeSwipeDialog";
import { CustomMealDialog } from "@/components/meal-planner/CustomMealDialog";
import { MealPlanInfoDialog } from "@/components/meal-planner/MealPlanInfoDialog";
import MealPlannerSkeleton from "@/components/meal-planner/MealPlannerSkeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useMealPlanModals } from "@/hooks/useMealPlanModals";
import { useMealPlannerOperations } from "@/hooks/useMealPlannerOperations";
import { useMealPlannerState } from "@/hooks/useMealPlannerState";
import { useMealPlannerLayout } from "@/hooks/useMealPlannerLayout";
import { MealType, Recipe, MealPlan } from "@/types";
import { GeneratedMeal, MealPlanGenerationMode } from "@/components/meal-planner/MealPlanQuantitiesDialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
    replaceFreetypedMealPlan,
    isLoading: mealPlansLoading
  } = useMealPlan();
  const { toast } = useToast();

  // Handle initial loading - show content immediately when data is available
  const isDataLoading = !user || !currentHousehold || recipesLoading || mealPlansLoading;
  
  const {
    currentWeek,
    setCurrentWeek,
    isLoading,
    quantitiesDialog,
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
  const [swipeDialog, setSwipeDialog] = useState(false);

  // Optional handoff from the recipe creator. Kept isolated from planner loading/render state.
  const [pendingCustomRecipe, setPendingCustomRecipe] = useState<{
    mealPlanId: string;
    customMealTitle: string;
    recipeId: string;
    recipeTitle: string;
    servings: number;
  } | null>(null);
  const [isReplacingCustomMeal, setIsReplacingCustomMeal] = useState(false);

  const currentMealPlans = getMealPlansForWeek(currentWeek);

  // Refresh once when the Meal Planner page mounts. Keep this completely
  // independent of the loading state so the refresh cannot cause a render loop.
  const hasRefreshedOnMount = useRef(false);
  useEffect(() => {
    if (!user?.id || !currentHousehold?.id || hasRefreshedOnMount.current) return;
    hasRefreshedOnMount.current = true;
    fetchMealPlans();

    const pending = sessionStorage.getItem("realimeali_pending_custom_recipe");
    if (pending) {
      try {
        const parsed = JSON.parse(pending);
        if (
          parsed?.mealPlanId &&
          parsed?.recipeId &&
          parsed?.recipeTitle
        ) {
          setPendingCustomRecipe(parsed);
        } else {
          sessionStorage.removeItem("realimeali_pending_custom_recipe");
        }
      } catch {
        sessionStorage.removeItem("realimeali_pending_custom_recipe");
      }
    }

    // Intentionally mount-only: fetchMealPlans updates context loading state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    handleAddRecipeToMeal,
    handleRemoveMeal,
    handleCreateLeftover,
    handleReorderMeals,
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
    setAddMealModal,
    toast,
    setServingsDialog,
    setPendingMealType,
    setClearAllDialog,
    refreshMealPlans: fetchMealPlans,
    currentMealPlans,
  });

  const handleRandomizeClick = useCallback(() => setQuantitiesDialog(true), [setQuantitiesDialog]);

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

  const handleConfirmGeneratedMeals = useCallback(async (meals: GeneratedMeal[], mode: MealPlanGenerationMode) => {
    if (!user || !currentHousehold || meals.length === 0) return;
    setIsLoading(true);
    try {
      if (mode === "replace") await clearWeek(currentWeek);
      const { year, week } = parseISOWeekKey(currentWeek);
      const date = formatLocalDateYMD(getWeekStartDate(year, week));
      const nextSlots: Record<string, number> = {};
      if (mode === "add") currentMealPlans.forEach(plan => {
        nextSlots[plan.meal_type] = Math.max(nextSlots[plan.meal_type] ?? -1, plan.slot_index ?? -1) + 1;
      });
      for (const meal of meals) {
        const slot = nextSlots[meal.mealType] ?? 0;
        nextSlots[meal.mealType] = slot + 1;
        await addMealPlan({
          date, meal_type: meal.mealType, recipe_id: meal.recipe.id, created_by: user.id, slot_index: slot,
          is_leftover: false, household_id: currentHousehold.id, week_key: currentWeek,
          original_servings: meal.recipe.servings || 1, planned_servings: meal.recipe.servings || 1,
          is_completed: false, is_freetyped: false,
        }, currentWeek, true);
      }
      await fetchMealPlans();
      setQuantitiesDialog(false);
      toast({ title: "Meal plan ready", description: "Added " + meals.length + " " + (meals.length === 1 ? "meal" : "meals") + " to your meal plan." });
    } catch (error) {
      console.error("Error adding generated meals:", error);
      toast({ title: "Couldn't add meal plan", description: error instanceof Error ? error.message : "Something went wrong.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user, currentHousehold, currentWeek, currentMealPlans, addMealPlan, clearWeek, fetchMealPlans, setIsLoading, setQuantitiesDialog, toast]);

  const handleClearAllConfirm = useCallback(() => {
    performClearAll();
  }, [performClearAll]);

  const dismissPendingCustomRecipe = useCallback(() => {
    sessionStorage.removeItem("realimeali_pending_custom_recipe");
    setPendingCustomRecipe(null);
  }, []);

  const handleKeepCustomRecipe = useCallback(() => {
    dismissPendingCustomRecipe();
  }, [dismissPendingCustomRecipe]);

  const handleReplaceCustomRecipe = useCallback(async () => {
    if (!pendingCustomRecipe) return;

    setIsReplacingCustomMeal(true);
    try {
      await replaceFreetypedMealPlan(
        pendingCustomRecipe.mealPlanId,
        pendingCustomRecipe.recipeId,
        pendingCustomRecipe.servings
      );
      dismissPendingCustomRecipe();
    } catch (error) {
      console.error("Failed to replace custom meal:", error);
      toast({
        title: "Couldn't replace meal",
        description: "The recipe was saved, but the custom meal could not be replaced.",
        variant: "destructive",
      });
    } finally {
      setIsReplacingCustomMeal(false);
    }
  }, [pendingCustomRecipe, replaceFreetypedMealPlan, dismissPendingCustomRecipe, toast]);

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
    <div className="container max-w-3xl mx-auto py-4 px-4 pb-8 sm:py-8 sm:px-6 sm:pb-12 min-h-screen" data-scroll-content style={{ scrollbarGutter: 'stable' }}>
      <MealPlannerHeader
        user={user}
        currentHousehold={currentHousehold}
        onInfoClick={() => setInfoDialog(true)}
      />

      <MealPlannerActions
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
        currentMealCount={currentMealPlans.length}
        onConfirmGeneratedMeals={handleConfirmGeneratedMeals}
        onSimpleMealSelect={handleSimpleMealSelect}
        onAddFreetypeMeal={handleAddFreetypeMeal}
        onLunchLeftoverConfirm={handleLunchLeftoverConfirm}
        onCreateLeftover={handleCreateLeftoverWithServings}
        onWarningReplace={() => {}}
        onWarningAdd={() => {}}
        onClearAllConfirm={handleClearAllConfirm}
        onServingsConfirm={handleServingsConfirm}
      />

      <Dialog
        open={Boolean(pendingCustomRecipe)}
        onOpenChange={(open) => {
          if (!open && !isReplacingCustomMeal) dismissPendingCustomRecipe();
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Recipe saved!</DialogTitle>
            <DialogDescription className="leading-relaxed">
              Would you like to replace <strong>{pendingCustomRecipe?.customMealTitle}</strong> in your meal plan with <strong>{pendingCustomRecipe?.recipeTitle}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleReplaceCustomRecipe}
              disabled={isReplacingCustomMeal}
              className="w-full bg-[#B85F49] text-white hover:bg-[#A65340] sm:w-auto"
            >
              {isReplacingCustomMeal ? "Replacing..." : "Replace Custom Meal"}
            </Button>
            <Button
              onClick={handleKeepCustomRecipe}
              variant="outline"
              disabled={isReplacingCustomMeal}
              className="w-full sm:w-auto"
            >
              Keep Custom Meal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RecipeSwipeDialog open={swipeDialog} onOpenChange={setSwipeDialog} recipes={recipes} />

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
