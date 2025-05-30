
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useMealPlanOperations } from "@/hooks/useMealPlanOperations";
import { MealPlannerDragAndDrop } from "@/components/meal-planner/MealPlannerDragAndDrop";
import { MealPlannerHeader } from "@/components/meal-planner/MealPlannerHeader";
import { AddRecipeToMealModal } from "@/components/meal-planner/AddRecipeToMealModal";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useMealPlanModals } from "@/hooks/useMealPlanModals";
import { MealType } from "@/types";

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
    } catch (err) {
      console.error("Error adding meal plan:", err);
    }
  };

  const handleAddRecipeWithLeftovers = async (
    recipe_id: string, 
    mealType: MealType, 
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
        user={user}
        currentHousehold={currentHousehold}
      />

      {/* Simple meal planner without calendar view for now */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Week {currentWeek} Meal Plan</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentWeek(1)}
              className={`px-4 py-2 rounded ${currentWeek === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Week 1
            </button>
            <button
              onClick={() => setCurrentWeek(2)}
              className={`px-4 py-2 rounded ${currentWeek === 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Week 2
            </button>
          </div>
        </div>

        <button
          onClick={() => setAddMealModal({ open: true, mealType: "dinner", date: null })}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add Meal
        </button>

        <div className="grid gap-4">
          {currentMealPlans.map((plan) => {
            const recipe = recipes.find(r => r.id === plan.recipe_id);
            return (
              <div key={plan.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{recipe?.title || 'Unknown Recipe'}</h3>
                <p className="text-sm text-gray-600">Meal Type: {plan.meal_type}</p>
                <button
                  onClick={() => removeMealPlan(plan.id)}
                  className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
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
