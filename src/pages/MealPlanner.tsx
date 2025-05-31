
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { MealPlannerHeader } from "@/components/meal-planner/MealPlannerHeader";
import { MealPlannerActions } from "@/components/meal-planner/MealPlannerActions";
import { WeekSelector } from "@/components/meal-planner/WeekSelector";
import { AddRecipeToMealModal } from "@/components/meal-planner/AddRecipeToMealModal";
import MealListSection from "@/components/MealListSection";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useMealPlanModals } from "@/hooks/useMealPlanModals";
import { useRandomMealSelection } from "@/hooks/useRandomMealSelection";
import { MealType, Recipe, MealPlan } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function MealPlanner() {
  useDocumentTitle("Meal Planner | RealiMeali");
  
  const { user } = useAuth();
  const { recipes } = useRecipes();
  const { currentHousehold } = useHousehold();
  const { 
    getMealPlansForWeek, 
    addMealPlan, 
    addMealPlanWithLeftovers,
    removeMealPlan, 
    clearWeek, 
    reorderMealPlans 
  } = useMealPlan();
  const { toast } = useToast();
  
  const [currentWeek, setCurrentWeek] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    addMealModal,
    setAddMealModal,
    clearMealPlanDialog,
    setClearMealPlanDialog,
  } = useMealPlanModals();

  const { generateRandomMealPlan } = useRandomMealSelection();

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

  const handleAddRecipeToMeal = async (recipe_id: string, mealType: MealType) => {
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
  };

  const handleAddMeal = (mealType: MealType) => {
    setAddMealModal({ open: true, mealType, date: null });
  };

  const handleRemoveMeal = async (planId: string) => {
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
  };

  const handleCreateLeftover = async (mealPlan: MealPlan, recipe: Recipe) => {
    if (!user || !currentHousehold) return;

    try {
      const leftoverData = {
        recipe_id: mealPlan.recipe_id,
        meal_type: 'lunch' as MealType,
        date: mealPlan.date,
        created_by: user.id,
        slot_index: 0,
        is_leftover: true,
        leftover_servings: Math.ceil(recipe.servings / 2),
        original_servings: recipe.servings,
        parent_meal_plan_id: mealPlan.id,
        household_id: currentHousehold.id,
        week_number: currentWeek,
      };

      await addMealPlan(leftoverData, currentWeek);
      
      toast({
        title: "Leftover Added",
        description: `${recipe.title} leftovers added to lunch`,
      });
    } catch (err) {
      console.error("Error creating leftover:", err);
      toast({
        title: "Error",
        description: "Failed to create leftover meal",
        variant: "destructive",
      });
    }
  };

  const handleReorderMeals = async (mealType: MealType, sourceIndex: number, destinationIndex: number) => {
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
  };

  const handleRandomize = async () => {
    if (!user || !currentHousehold) return;
    
    setIsLoading(true);
    try {
      await generateRandomMealPlan({
        dinner: 5,
        lunch: 2,
        breakfast: 2,
        snacks: 2
      });
      toast({
        title: "Meal Plan Generated",
        description: `Random meal plan created for week ${currentWeek}`,
      });
    } catch (err) {
      console.error("Error generating meal plan:", err);
      toast({
        title: "Error",
        description: "Failed to generate meal plan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    toast({
      title: "Share",
      description: "Share functionality coming soon!",
    });
  };

  const handleClearAll = async () => {
    if (!user || !currentHousehold) return;
    
    const confirmed = window.confirm(`Are you sure you want to clear all meals for week ${currentWeek}?`);
    if (!confirmed) return;

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
  };

  if (!user || !currentHousehold) {
    return (
      <div className="container max-w-7xl py-8 px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-navy mb-4">Meal Planner</h1>
          <p className="text-muted-foreground">Please log in and select a household to start meal planning.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-8 px-6 space-y-8">
      <MealPlannerHeader
        user={user}
        currentHousehold={currentHousehold}
      />

      <MealPlannerActions
        onRandomize={handleRandomize}
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

      {addMealModal.open && (
        <AddRecipeToMealModal
          open={addMealModal.open}
          onClose={() => setAddMealModal({ open: false, mealType: null, date: null })}
          mealSlot={{ 
            date: new Date().toISOString().split('T')[0], 
            mealType: addMealModal.mealType || "dinner"
          }}
          onAddRecipe={async (recipeId: string) => {
            await handleAddRecipeToMeal(recipeId, addMealModal.mealType || "dinner");
          }}
        />
      )}
    </div>
  );
}
