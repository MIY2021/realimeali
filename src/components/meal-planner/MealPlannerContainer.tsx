
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useMealPlanModals } from "@/hooks/useMealPlanModals";
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
    currentMealPlans,
  } = useMealPlanModals();

  const {
    handleAddMeal,
    handleAddRecipeToMeal,
    handleRemoveMeal,
    handleCreateLeftover,
    handleRandomize,
    handleShare,
    handleClearAll,
    handleReorderMeals,
    onSimpleMealSelect,
    onLunchLeftoverConfirm,
    onRandomizeWithQuantities,
    onWarningConfirm,
    onClearAllConfirm,
    onServingsConfirm,
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
    setAddMealModal: setSimpleMealDialog,
    setIsLoading,
    toast,
    setQuantitiesDialog,
    setServingsDialog,
    setPendingMealType,
    setClearAllDialog,
    refreshMealPlans: async () => {},
    currentMealPlans,
  });

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
      />
    </>
  );
}
