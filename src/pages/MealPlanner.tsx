import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useMealPlanOperations } from "@/hooks/useMealPlanOperations";
import { MealPlannerDragAndDrop } from "@/components/meal-planner/MealPlannerDragAndDrop";
import { MealPlannerHeader } from "@/components/meal-planner/MealPlannerHeader";
import { MealPlannerModals } from "@/components/meal-planner/MealPlannerModals";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useMealPlanModals } from "@/hooks/useMealPlanModals";
import { MealPlanMealType } from "@/types";

export default function MealPlanner() {
  useDocumentTitle("Meal Planner | RealiMeali");
  
  const { user } = useAuth();
  const { recipes } = useRecipes();
  const { currentHousehold } = useHousehold();
  const { getMealPlansForWeek, addMealPlan, removeMealPlan, addMealPlanWithLeftovers, clearWeek, reorderMealPlans } = useMealPlan();
  const { isLoading, error, addMealPlan: addMealPlanOp, removeMealPlan: removeMealPlanOp } = useMealPlanOperations();
  
  const [currentWeek, setCurrentWeek] = useState<1 | 2>(1);
  const [isCalendarView, setIsCalendarView] = useState(false);
  
  const {
    addMealModal,
    setAddMealModal,
    editMealModal,
    setEditMealModal,
    removeMealModal,
    setRemoveMealModal,
  } = useMealPlanModals();

  const [leftoverServings, setLeftoverServings] = useState<number>(0);

  const currentMealPlans = getMealPlansForWeek(currentWeek);

  const handleAddRecipeToMeal = async (recipe_id: string, mealType: MealPlanMealType) => {
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
    } catch (err) {
      console.error("Error adding meal plan:", err);
    }
  };

  const handleAddRecipeWithLeftovers = async (
    recipe_id: string, 
    mealType: MealPlanMealType, 
    leftoverServings: number
  ) => {
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

      await addMealPlanWithLeftovers(mealPlanData, currentWeek, leftoverServings);
      setAddMealModal({ open: false, mealType: null, date: null });
    } catch (err) {
      console.error("Error adding meal plan with leftovers:", err);
    }
  };

  const handleLeftoverChange = (servings: number) => {
    setLeftoverServings(servings);
  };

  const confirmRemoveMeal = async () => {
    // Implementation for removing meal
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
        weekNumber={currentWeek}
        onWeekChange={setCurrentWeek}
        isCalendarView={isCalendarView}
        setIsCalendarView={setIsCalendarView}
      />

      <MealPlannerDragAndDrop
        currentWeek={currentWeek}
        isCalendarView={isCalendarView}
        mealPlans={currentMealPlans}
        recipes={recipes}
        onAddMeal={(mealType: MealPlanMealType, date: string) => 
          setAddMealModal({ open: true, mealType, date })
        }
        onEditMeal={(planId: string) => {
          // Find the meal plan and recipe for editing
          const plan = currentMealPlans.find(p => p.id === planId);
          const recipe = plan ? recipes.find(r => r.id === plan.recipe_id) : undefined;
          if (plan && recipe) {
            // Handle edit functionality here
          }
        }}
        onRemoveMeal={(planId: string) => removeMealPlan(planId)}
        reorderMealPlans={reorderMealPlans}
      />

      <MealPlannerModals
        modals={{
          addMealModal,
          setAddMealModal,
          editMealModal,
          setEditMealModal,
          removeMealModal,
          setRemoveMealModal,
        }}
        actions={{
          handleAddRecipeToMeal,
          handleAddRecipeWithLeftovers,
          handleLeftoverChange,
          confirmRemoveMeal,
        }}
        state={{
          currentWeek,
          leftoverServings,
        }}
      />
    </div>
  );
}
