
import { useCallback } from "react";
import { MealType, Recipe } from "@/types";
import { mealPlanService } from "@/services/mealPlanService";

interface UseMealPlannerOperationsProps {
  user: any;
  currentHousehold: any;
  recipes: Recipe[];
  currentWeek: 1 | 2;
  addMealPlan: any;
  removeMealPlan: any;
  clearWeek: any;
  reorderMealPlans: any;
  generateRandomMealPlan: (quantities: any, weekNumber: 1 | 2) => Promise<number>;
  setAddMealModal: any;
  setIsLoading: (loading: boolean) => void;
  toast: any;
  setQuantitiesDialog: (open: boolean) => void;
  setServingsDialog: (open: boolean) => void;
  setPendingMealType: (mealType: MealType | null) => void;
  setClearAllDialog?: (open: boolean) => void;
}

export const useMealPlannerOperations = ({
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
}: UseMealPlannerOperationsProps) => {

  const handleAddRecipeToMeal = useCallback(async (recipe_id: string, mealType: MealType) => {
    if (!user || !currentHousehold) return;

    const recipe = recipes.find(r => r.id === recipe_id);
    if (!recipe) return;

    try {
      const mealPlanData = {
        recipe_id: recipe_id,
        meal_type: mealType,
        date: new Date().toISOString().split('T')[0],
        created_by: user.id,
        slot_index: 0,
        is_leftover: false,
        household_id: currentHousehold.id,
        week_number: currentWeek,
        original_servings: recipe.servings,
      };

      await addMealPlan(mealPlanData, currentWeek);
      setAddMealModal({ open: false, mealType: null, date: null });
      
      toast({
        title: "Meal Added",
        description: `${recipe.title} added to ${mealType}`,
      });
    } catch (err) {
      console.error("Error adding meal plan:", err);
      toast({
        title: "Error",
        description: "Failed to add meal to plan",
        variant: "destructive",
      });
    }
  }, [user, currentHousehold, recipes, currentWeek, addMealPlan, setAddMealModal, toast]);

  const handleAddMeal = useCallback((mealType: MealType) => {
    console.log("🍽️ handleAddMeal called with mealType:", mealType);
    setPendingMealType(mealType);
    setServingsDialog(true);
    console.log("✅ Set pending meal type and opened servings dialog");
  }, [setPendingMealType, setServingsDialog]);

  const handleRemoveMeal = useCallback(async (planId: string) => {
    try {
      await removeMealPlan(planId);
      toast({
        title: "Meal Removed",
        description: "Meal removed from plan",
      });
    } catch (err) {
      console.error("Error removing meal:", err);
      toast({
        title: "Error",
        description: "Failed to remove meal",
        variant: "destructive",
      });
    }
  }, [removeMealPlan, toast]);

  const handleCreateLeftover = useCallback(async (mealPlan: any, recipe: Recipe, leftoverServings?: number) => {
    if (!user || !currentHousehold) {
      console.error("No user or household available for leftover creation");
      toast({
        title: "Error",
        description: "Please log in and select a household",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Creating leftover with data:", { 
        mealPlan: mealPlan.id, 
        recipe: recipe.title, 
        leftoverServings, 
        currentWeek,
        userId: user.id,
        householdId: currentHousehold.id
      });

      const servingsToSave = leftoverServings || Math.ceil(recipe.servings / 2);
      
      const leftoverData = {
        recipe_id: mealPlan.recipe_id,
        meal_type: 'lunch' as MealType,
        date: mealPlan.date,
        created_by: user.id,
        slot_index: 0,
        is_leftover: true,
        leftover_servings: servingsToSave,
        original_servings: recipe.servings,
        parent_meal_plan_id: mealPlan.id,
        household_id: currentHousehold.id,
        week_number: currentWeek,
      };

      console.log("Creating leftover meal with data:", leftoverData);

      // Create the leftover meal
      await addMealPlan(leftoverData, currentWeek);
      console.log("Leftover meal created successfully");

      // Update the original dinner meal to track leftover allocation
      console.log("Updating original meal plan leftover allocation");
      await mealPlanService.updateMealPlanLeftoverAllocation(
        mealPlan.id,
        servingsToSave,
        currentHousehold.id
      );
      console.log("Original meal plan updated successfully");

      const remainingServings = recipe.servings - servingsToSave;
      
      toast({
        title: "Leftover Added",
        description: `${servingsToSave} servings of ${recipe.title} saved for lunch. Dinner now shows ${remainingServings} servings.`,
      });
    } catch (err) {
      console.error("Error creating leftover:", err);
      console.error("Error details:", {
        message: err?.message,
        stack: err?.stack,
        name: err?.name
      });
      toast({
        title: "Error",
        description: `Failed to create leftover meal: ${err?.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  }, [user, currentHousehold, currentWeek, addMealPlan, toast]);

  const handleReorderMeals = useCallback(async (mealType: MealType, sourceIndex: number, destinationIndex: number) => {
    try {
      await reorderMealPlans(mealType, currentWeek, sourceIndex, destinationIndex);
    } catch (err) {
      console.error("Error reordering meals:", err);
      toast({
        title: "Error",
        description: "Failed to reorder meals",
        variant: "destructive",
      });
    }
  }, [reorderMealPlans, currentWeek, toast]);

  const handleRandomize = useCallback(() => {
    console.log("🎲 handleRandomize called - starting debug trace");
    console.log("📊 Current state:", {
      user: !!user,
      currentHousehold: !!currentHousehold,
      userId: user?.id,
      householdId: currentHousehold?.id,
      setQuantitiesDialog: typeof setQuantitiesDialog
    });
    
    if (!user || !currentHousehold) {
      console.log("❌ No user or household for randomize");
      toast({
        title: "Error",
        description: "Please log in and select a household",
        variant: "destructive",
      });
      return;
    }
    
    console.log("✅ User and household validated, calling setQuantitiesDialog(true)");
    setQuantitiesDialog(true);
    console.log("🎯 setQuantitiesDialog(true) called - dialog should now be open");
  }, [user, currentHousehold, setQuantitiesDialog, toast]);

  const handleRandomizeWithQuantities = useCallback(async (quantities: { 
    dinner: number; 
    lunch: number; 
    breakfast: number; 
    snacks: number;
    sides: number;
    desserts: number;
    drinks: number;
  }) => {
    console.log("🎯 handleRandomizeWithQuantities called with:", quantities);
    console.log("📊 Generation context validation:", {
      user: !!user,
      currentHousehold: !!currentHousehold,
      userId: user?.id,
      householdId: currentHousehold?.id,
      currentWeek,
      availableRecipes: recipes.length,
      generateRandomMealPlan: typeof generateRandomMealPlan
    });
    
    if (!user || !currentHousehold) {
      console.log("❌ No user or household for randomize with quantities");
      toast({
        title: "Error",
        description: "Please log in and select a household",
        variant: "destructive",
      });
      return;
    }
    
    if (!generateRandomMealPlan) {
      console.error("❌ generateRandomMealPlan function is missing!");
      toast({
        title: "Error",
        description: "Meal plan generation is not available",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    console.log('🚀 Starting meal plan generation process...');
    
    try {
      console.log('📋 About to call generateRandomMealPlan with:', {
        quantities,
        currentWeek,
        totalRecipes: recipes.length
      });
      
      const totalAdded = await generateRandomMealPlan(quantities, currentWeek);
      
      console.log('🎉 Meal plan generation completed successfully! Total added:', totalAdded);
      
      if (totalAdded > 0) {
        toast({
          title: "Meal Plan Generated",
          description: `Added ${totalAdded} meals to week ${currentWeek}`,
        });
      } else {
        console.log("⚠️ No meals were added during generation");
        toast({
          title: "No meals added",
          description: "No suitable recipes found for the selected meal types",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("💥 Error generating meal plan:", err);
      console.error("Error details:", {
        message: err?.message,
        stack: err?.stack,
        name: err?.name
      });
      toast({
        title: "Error",
        description: `Failed to generate meal plan: ${err?.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log('🏁 Generation process complete, loading set to false');
    }
  }, [user, currentHousehold, currentWeek, generateRandomMealPlan, setIsLoading, toast, recipes]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Week ${currentWeek} Meal Plan`,
          text: 'Check out my meal plan!',
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Meal plan link copied to clipboard",
        });
      } catch (err) {
        toast({
          title: "Share",
          description: "Share functionality not available",
        });
      }
    }
  }, [currentWeek, toast]);

  const handleClearAll = useCallback(() => {
    if (!user || !currentHousehold) return;
    
    // Use the dialog if available, otherwise fallback to confirm
    if (setClearAllDialog) {
      setClearAllDialog(true);
    } else {
      const confirmed = window.confirm(`Are you sure you want to clear all meals for week ${currentWeek}?`);
      if (confirmed) {
        performClearAll();
      }
    }
  }, [user, currentHousehold, currentWeek, setClearAllDialog]);

  const performClearAll = useCallback(async () => {
    if (!user || !currentHousehold) return;

    setIsLoading(true);
    try {
      await clearWeek(currentWeek);
      toast({
        title: "Week Cleared",
        description: `All meals cleared for week ${currentWeek}`,
      });
    } catch (err) {
      console.error("Error clearing week:", err);
      toast({
        title: "Error",
        description: "Failed to clear week",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, currentHousehold, currentWeek, clearWeek, setIsLoading, toast]);

  return {
    handleAddRecipeToMeal,
    handleAddMeal,
    handleRemoveMeal,
    handleCreateLeftover,
    handleReorderMeals,
    handleRandomize,
    handleRandomizeWithQuantities,
    handleShare,
    handleClearAll,
    performClearAll,
  };
};
