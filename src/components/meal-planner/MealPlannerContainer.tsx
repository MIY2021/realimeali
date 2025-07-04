import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { MealPlannerContent } from "./MealPlannerContent";
import { MealPlannerModalsContainer } from "./MealPlannerModalsContainer";
import { useMealPlannerState } from "@/hooks/useMealPlannerState";
import { useMealPlannerOperations } from "@/hooks/useMealPlannerOperations";
import { MealType, Recipe } from "@/types";
import { SimpleMealSelectionDialog } from "./SimpleMealSelectionDialog";
import { useToast } from "@/hooks/use-toast";

export default function MealPlannerContainer() {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { addMealPlan } = useMealPlan();
  const { recipes } = useRecipes();
  const { toast } = useToast();
  
  const {
    selectedWeek,
    setSelectedWeek,
    selectedMealType,
    setSelectedMealType,
    showAddMealDialog,
    setShowAddMealDialog,
  } = useMealPlannerState();

  const {
    handleAddRecipeToMeal,
  } = useMealPlannerOperations({
    selectedWeek,
    selectedMealType,
    setShowAddMealDialog,
  });

  const handleAddFreetypeMeal = async (mealName: string) => {
    if (!user || !currentHousehold || !selectedMealType) {
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
        meal_type: selectedMealType,
        slot_index: 0,
        is_leftover: false,
        original_servings: 1,
        planned_servings: 1,
        household_id: currentHousehold.id,
        week_number: selectedWeek,
        created_by: user.id,
        is_completed: false,
        meal_name: mealName,
        is_freetyped: true,
      };

      await addMealPlan(newMealPlan, selectedWeek, currentHousehold.id, user.id);
      
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

  const handleSelectRecipe = async (recipe: Recipe) => {
    await handleAddRecipeToMeal(recipe);
  };

  return (
    <>
      <MealPlannerContent
        selectedWeek={selectedWeek}
        setSelectedWeek={setSelectedWeek}
        selectedMealType={selectedMealType}
        setSelectedMealType={setSelectedMealType}
        showAddMealDialog={showAddMealDialog}
        setShowAddMealDialog={setShowAddMealDialog}
      />
      
      <SimpleMealSelectionDialog
        isOpen={showAddMealDialog}
        onClose={() => setShowAddMealDialog(false)}
        recipes={recipes}
        onSelectRecipe={handleSelectRecipe}
        onAddFreetypeMeal={handleAddFreetypeMeal}
        mealType={selectedMealType || 'dinner'}
      />

      <MealPlannerModalsContainer
        selectedWeek={selectedWeek}
        setSelectedWeek={setSelectedWeek}
        selectedMealType={selectedMealType}
        setSelectedMealType={setSelectedMealType}
        showAddMealDialog={showAddMealDialog}
        setShowAddMealDialog={setShowAddMealDialog}
      />
    </>
  );
}
