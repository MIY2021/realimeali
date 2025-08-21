
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { MealType, Recipe, MealPlan } from "@/types";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useToast } from "@/hooks/use-toast";
import { useLeftoverOperations } from "@/hooks/useLeftoverOperations";
import { MealPlannerContent } from "./MealPlannerContent";
import { MealPlannerModalsContainer } from "./MealPlannerModalsContainer";

interface MealPlannerContainerProps {
  currentWeek: 1 | 2;
}

export function MealPlannerContainer({ currentWeek }: MealPlannerContainerProps) {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { recipes } = useRecipes();
  const { toast } = useToast();
  const {
    mealPlans,
    getMealPlansForWeek,
    getRecipeForMealPlan,
    addMealPlan,
    removeMealPlan,
    clearWeek,
    reorderMealPlans,
    fetchMealPlans,
  } = useMealPlan();

  // Modal states
  const [quantitiesDialog, setQuantitiesDialog] = useState(false);
  const [simpleMealDialog, setSimpleMealDialog] = useState(false);
  const [leftoverDialog, setLeftoverDialog] = useState(false);
  const [warningDialog, setWarningDialog] = useState(false);
  const [clearAllDialog, setClearAllDialog] = useState(false);
  const [servingsDialog, setServingsDialog] = useState(false);
  const [pendingMealType, setPendingMealType] = useState<MealType | null>(null);
  const [pendingLeftoverData, setPendingLeftoverData] = useState<{ mealPlan: MealPlan; recipe?: Recipe } | null>(null);

  // Initialize leftover operations
  const { handleCreateLeftover: createLeftoverOperation } = useLeftoverOperations({
    user,
    currentHousehold,
    currentWeek,
    addMealPlan,
    toast,
    refreshMealPlans: fetchMealPlans,
  });

  const currentWeekMealPlans = useMemo(() => {
    return getMealPlansForWeek(currentWeek);
  }, [getMealPlansForWeek, currentWeek]);

  // Handle leftover creation
  const handleCreateLeftover = useCallback(async (mealPlan: MealPlan, recipe?: Recipe) => {
    console.log("🍽️ MealPlannerContainer handleCreateLeftover called:", { 
      mealPlanId: mealPlan.id, 
      hasRecipe: !!recipe,
      isFreetype: mealPlan.is_freetyped,
      mealName: mealPlan.meal_name 
    });

    try {
      if (mealPlan.is_freetyped) {
        // For custom meals, directly create leftover without modal
        console.log("🍽️ Creating leftover for custom meal:", mealPlan.meal_name);
        await createLeftoverOperation(mealPlan, undefined, undefined);
      } else if (recipe) {
        // For recipe meals, show modal to choose servings
        console.log("🍽️ Opening leftover modal for recipe meal:", recipe.title);
        setPendingLeftoverData({ mealPlan, recipe });
        setLeftoverDialog(true);
      } else {
        console.error("🍽️ No recipe found for meal plan:", mealPlan.id);
        toast({
          title: "Error",
          description: "Recipe not found for this meal",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("🍽️ Error in handleCreateLeftover:", error);
      toast({
        title: "Error",
        description: "Failed to create leftover",
        variant: "destructive",
      });
    }
  }, [createLeftoverOperation, toast]);

  // Handle adding meals
  const handleAddMeal = useCallback((mealType: MealType) => {
    console.log("🍽️ Adding meal for type:", mealType);
    setPendingMealType(mealType);
    setSimpleMealDialog(true);
  }, []);

  // Handle random meal generation
  const handleRandomizeWithQuantities = useCallback(async (quantities: any) => {
    setQuantitiesDialog(false);
    // Implementation for randomizing meals would go here
  }, []);

  // Handle simple meal selection
  const handleSimpleMealSelect = useCallback(async (recipeId: string) => {
    if (!pendingMealType) return;
    
    try {
      const recipe = recipes.find(r => r.id === recipeId);
      if (!recipe) throw new Error("Recipe not found");

      await addMealPlan({
        recipe_id: recipeId,
        meal_type: pendingMealType,
        date: new Date().toISOString().split('T')[0],
        created_by: user?.id || '',
        slot_index: 0,
        planned_servings: recipe.servings,
        household_id: currentHousehold?.id || '',
        week_number: currentWeek,
        is_completed: false,
        is_freetyped: false,
      }, currentWeek);

      setSimpleMealDialog(false);
      setPendingMealType(null);
    } catch (error) {
      console.error("Error adding meal:", error);
    }
  }, [pendingMealType, recipes, addMealPlan, user?.id, currentHousehold?.id, currentWeek]);

  // Handle freetype meal addition
  const handleAddFreetypeMeal = useCallback(async (mealName: string, servings: number) => {
    if (!pendingMealType) return;

    try {
      await addMealPlan({
        meal_type: pendingMealType,
        date: new Date().toISOString().split('T')[0],
        created_by: user?.id || '',
        slot_index: 0,
        planned_servings: servings,
        household_id: currentHousehold?.id || '',
        week_number: currentWeek,
        is_completed: false,
        is_freetyped: true,
        meal_name: mealName,
      }, currentWeek);

      setSimpleMealDialog(false);
      setPendingMealType(null);
    } catch (error) {
      console.error("Error adding freetype meal:", error);
    }
  }, [pendingMealType, addMealPlan, user?.id, currentHousehold?.id, currentWeek]);

  // Handle leftover confirmation from modal
  const handleLunchLeftoverConfirm = useCallback(async (servings: number) => {
    if (!pendingLeftoverData) return;

    try {
      await createLeftoverOperation(pendingLeftoverData.mealPlan, pendingLeftoverData.recipe, servings);
      setLeftoverDialog(false);
      setPendingLeftoverData(null);
    } catch (error) {
      console.error("Error creating leftover:", error);
    }
  }, [pendingLeftoverData, createLeftoverOperation]);

  // Handle other modal confirmations
  const handleWarningConfirm = useCallback(() => {
    setWarningDialog(false);
  }, []);

  const handleClearAllConfirm = useCallback(async () => {
    try {
      await clearWeek(currentWeek);
      setClearAllDialog(false);
    } catch (error) {
      console.error("Error clearing week:", error);
    }
  }, [clearWeek, currentWeek]);

  const handleServingsConfirm = useCallback((mealType: MealType, servings: number) => {
    setServingsDialog(false);
    setPendingMealType(null);
  }, []);

  return (
    <>
      <MealPlannerContent
        currentWeek={currentWeek}
        mealPlans={currentWeekMealPlans}
        recipes={recipes}
        onAddMeal={handleAddMeal}
        onRemoveMeal={removeMealPlan}
        onCreateLeftover={handleCreateLeftover}
        onReorderMeals={reorderMealPlans}
        getRecipeById={(id: string) => recipes.find(r => r.id === id)}
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
        onAddFreetypeMeal={handleAddFreetypeMeal}
        onLunchLeftoverConfirm={handleLunchLeftoverConfirm}
        onCreateLeftover={createLeftoverOperation}
        onWarningConfirm={handleWarningConfirm}
        onClearAllConfirm={handleClearAllConfirm}
        onServingsConfirm={handleServingsConfirm}
      />
    </>
  );
}
