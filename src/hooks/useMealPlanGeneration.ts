
import { useCallback } from "react";

interface UseMealPlanGenerationProps {
  user: any;
  currentHousehold: any;
  currentWeek: 1 | 2;
  generateRandomMealPlan: (quantities: any, weekNumber: 1 | 2) => Promise<number>;
  clearWeek: any;
  setIsLoading: (loading: boolean) => void;
  setQuantitiesDialog: (open: boolean) => void;
  toast: any;
  recipes: any[];
  refreshMealPlans?: () => Promise<void>;
}

export const useMealPlanGeneration = ({
  user,
  currentHousehold,
  currentWeek,
  generateRandomMealPlan,
  clearWeek,
  setIsLoading,
  setQuantitiesDialog,
  toast,
  recipes,
  refreshMealPlans,
}: UseMealPlanGenerationProps) => {

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
      generateRandomMealPlan: typeof generateRandomMealPlan,
      refreshMealPlans: typeof refreshMealPlans
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
      // Clear existing meal plans for the week FIRST
      console.log('🧹 Clearing existing meal plans for week', currentWeek);
      await clearWeek(currentWeek);
      console.log('✅ Week cleared successfully');
      
      console.log('📋 About to call generateRandomMealPlan with:', {
        quantities,
        currentWeek,
        totalRecipes: recipes.length
      });
      
      const totalAdded = await generateRandomMealPlan(quantities, currentWeek);
      
      console.log('🎉 Meal plan generation completed successfully! Total added:', totalAdded);
      
      // Refresh the meal plans to update the UI
      if (refreshMealPlans) {
        console.log('🔄 Refreshing meal plans to update UI...');
        await refreshMealPlans();
        console.log('✅ Meal plans refreshed successfully');
      } else {
        console.log('⚠️ refreshMealPlans function not available');
      }
      
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
  }, [user, currentHousehold, currentWeek, generateRandomMealPlan, clearWeek, setIsLoading, toast, recipes, refreshMealPlans]);

  return {
    handleRandomize,
    handleRandomizeWithQuantities,
  };
};
