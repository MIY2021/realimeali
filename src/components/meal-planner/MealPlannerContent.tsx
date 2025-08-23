
import { useCallback } from "react";
import { MealPlannerActions } from "@/components/meal-planner/MealPlannerActions";
import MealListSection from "@/components/MealListSection";
import { MealType, Recipe, MealPlan } from "@/types";

interface MealPlannerContentProps {
  currentWeek: 1 | 2;
  setCurrentWeek: (week: 1 | 2) => void;
  isLoading: boolean;
  currentMealPlans: MealPlan[];
  recipes: Recipe[];
  onRandomize: () => void;
  onShare: () => void;
  onClearAll: () => void;
  onAddMeal: (mealType: MealType) => void;
  onAddCustomMeal: (mealType: MealType) => void;
  onRemoveMeal: (planId: string) => void;
  onCreateLeftover: (mealPlan: MealPlan, recipe: Recipe) => void;
  onReorderMeals: (mealType: MealType, sourceIndex: number, destinationIndex: number) => Promise<void>;
}

export const MealPlannerContent = ({
  currentWeek,
  setCurrentWeek,
  isLoading,
  currentMealPlans,
  recipes,
  onRandomize,
  onShare,
  onClearAll,
  onAddMeal,
  onAddCustomMeal,
  onRemoveMeal,
  onCreateLeftover,
  onReorderMeals,
}: MealPlannerContentProps) => {
  const mealTypes: MealType[] = ["dinner", "lunch", "breakfast", "snacks", "sides", "desserts", "drinks"];

  const getMealPlansForType = useCallback((mealType: MealType): MealPlan[] => {
    return currentMealPlans
      .filter(plan => plan.meal_type === mealType)
      .sort((a, b) => (a.slot_index || 0) - (b.slot_index || 0));
  }, [currentMealPlans]);

  const getRecipeById = useCallback((id: string): Recipe | undefined => {
    return recipes.find(recipe => recipe.id === id);
  }, [recipes]);

  return (
    <div className="space-y-1">
      <MealPlannerActions
        onRandomize={onRandomize}
        onShare={onShare}
        onClearAll={onClearAll}
        isLoading={isLoading}
        currentWeek={currentWeek}
        setCurrentWeek={setCurrentWeek}
      />

      <div className="space-y-3">
        {mealTypes.map((mealType, index) => (
          <MealListSection
            key={mealType}
            mealType={mealType}
            mealPlans={getMealPlansForType(mealType)}
            getRecipeById={getRecipeById}
            onAddMeal={onAddMeal}
            onAddCustomMeal={onAddCustomMeal}
            onRemoveMeal={onRemoveMeal}
            onCreateLeftover={onCreateLeftover}
            onReorderMeals={onReorderMeals}
            sectionIndex={index}
          />
        ))}
      </div>
    </div>
  );
};
