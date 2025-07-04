
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useMealPlannerState } from "@/hooks/useMealPlannerState";
import { useMealPlannerOperations } from "@/hooks/useMealPlannerOperations";
import { MealPlannerContent } from "./MealPlannerContent";
import { MealPlannerModalsContainer } from "./MealPlannerModalsContainer";
import { MealType, Recipe } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function MealPlannerContainer() {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { addMealPlan } = useMealPlan();
  const { recipes } = useRecipes();
  const { toast } = useToast();
  
  const {
    currentWeek,
    setCurrentWeek,
    isLoading,
    setIsLoading,
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
    setPendingLeftoverData,
  } = useMealPlannerState();

  const { getMealPlansForWeek } = useMealPlan();
  const currentMealPlans = getMealPlansForWeek(currentWeek);

  const {
    handleAddMeal,
    handleAddRecipeToMeal,
    handleRemoveMeal,
    handleCreateLeftover,
    handleRandomize,
    handleShare,
    handleClearAll,
    handleReorderMeals,
  } = useMealPlannerOperations({
    user,
    currentHousehold,
    recipes,
    currentWeek,
    addMealPlan,
    removeMealPlan: async () => {}, // Will be handled by the operations hook
    clearWeek: async () => {}, // Will be handled by the operations hook
    reorderMealPlans: async () => {}, // Will be handled by the operations hook
    generateRandomMealPlan: async () => 0, // Will be handled by the operations hook
    setAddMealModal: () => setSimpleMealDialog(true),
    setIsLoading,
    toast,
    setQuantitiesDialog,
    setServingsDialog,
    setPendingMealType,
    setClearAllDialog,
    refreshMealPlans: async () => {},
    currentMealPlans,
  });

  const onSimpleMealSelect = async (recipe: Recipe) => {
    try {
      setIsLoading(true);
      await addMealPlan({
        date: new Date().toISOString().split('T')[0],
        meal_type: pendingMealType || 'dinner',
        recipe_id: recipe.id,
        created_by: user!.id,
        slot_index: 0,
        is_leftover: false,
        household_id: currentHousehold!.id,
        week_number: currentWeek,
        original_servings: recipe.servings,
        planned_servings: recipe.servings,
        is_completed: false,
        is_freetyped: false,
      }, currentWeek);
      setSimpleMealDialog(false);
      setPendingMealType(null);
    } catch (error) {
      console.error("Error adding meal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRandomizeWithQuantities = async (quantities: any) => {
    setQuantitiesDialog(false);
    // Call actual randomization logic
  };

  const onLunchLeftoverConfirm = async (servings: number) => {
    setLeftoverDialog(false);
    // Handle leftover creation
  };

  const onWarningConfirm = () => {
    setWarningDialog(false);
    // Handle warning confirmation
  };

  const onClearAllConfirm = async () => {
    setClearAllDialog(false);
    // Handle clear all confirmation
  };

  const onServingsConfirm = async (mealType: MealType, servings: number) => {
    setServingsDialog(false);
    // Handle servings confirmation
  };

  const handleAddFreetypeMeal = async (mealName: string, mealType: MealType) => {
    if (!user || !currentHousehold) {
      toast({
        title: "Error",
        description: "Missing required information to add meal",
        variant: "destructive",
      });
      return;
    }

    try {
      const newMealPlan = {
        date: new Date().toISOString().split('T')[0],
        meal_type: mealType,
        slot_index: 0,
        is_leftover: false,
        original_servings: 1,
        planned_servings: 1,
        household_id: currentHousehold.id,
        week_number: currentWeek,
        created_by: user.id,
        is_completed: false,
        meal_name: mealName,
        is_freetyped: true,
      };

      await addMealPlan(newMealPlan, currentWeek);
      
      toast({
        title: "Custom meal added",
        description: `${mealName} has been added to your meal plan`,
      });
    } catch (error) {
      console.error("Error adding freetyped meal:", error);
      toast({
        title: "Error",
        description: "Failed to add custom meal",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <MealPlannerContent
        currentWeek={currentWeek}
        setCurrentWeek={setCurrentWeek}
        isLoading={isLoading}
        currentMealPlans={currentMealPlans}
        recipes={recipes}
        onRandomize={handleRandomize}
        onShare={handleShare}
        onClearAll={handleClearAll}
        onAddMeal={handleAddMeal}
        onRemoveMeal={handleRemoveMeal}
        onCreateLeftover={handleCreateLeftover}
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
        onRandomizeWithQuantities={onRandomizeWithQuantities}
        onSimpleMealSelect={onSimpleMealSelect}
        onLunchLeftoverConfirm={onLunchLeftoverConfirm}
        onCreateLeftover={handleCreateLeftover}
        onWarningConfirm={onWarningConfirm}
        onClearAllConfirm={onClearAllConfirm}
        onServingsConfirm={onServingsConfirm}
        onAddFreetypeMeal={handleAddFreetypeMeal}
      />
    </>
  );
}
