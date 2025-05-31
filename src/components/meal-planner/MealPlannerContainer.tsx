
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
import { useMealPlannerOperations } from "@/hooks/useMealPlannerOperations";
import { MealType, Recipe, MealPlan } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function MealPlannerContainer() {
  useDocumentTitle("Meal Planner | RealiMeali");
  
  const { user } = useAuth();
  const { recipes } = useRecipes();
  const { currentHousehold } = useHousehold();
  const { 
    getMealPlansForWeek, 
    addMealPlan, 
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
  } = useMealPlanModals();

  const { generateRandomMealPlan } = useRandomMealSelection();

  const {
    handleAddRecipeToMeal,
    handleAddMeal,
    handleRemoveMeal,
    handleCreateLeftover,
    handleReorderMeals,
    handleRandomize,
    handleShare,
    handleClearAll,
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
