import { useCallback, useMemo } from "react";
import { MealPlannerActions } from "@/components/meal-planner/MealPlannerActions";
import { MealPlannerGridView } from "@/components/meal-planner/MealPlannerGridView";
import MealListSection from "@/components/MealListSection";
import { MealType, Recipe, MealPlan } from "@/types";

interface MealPlannerContentProps {
  currentWeek: string; // ISO week key
  setCurrentWeek: (week: string) => void;
  isLoading: boolean;
  isDataLoading?: boolean;
  currentMealPlans: MealPlan[];
  allMealPlans?: MealPlan[]; // For CalendarMonthModal
  recipes: Recipe[];
  mealLayout: string;
  onMealLayoutChange: (value: string) => void;
  onRandomize: () => void;
  onShare: () => void;
  onClearAll: () => void;
  onAddMeal: (mealType: MealType) => void;
  onAddCustomMeal: (mealType: MealType) => void;
  onRemoveMeal: (planId: string) => void;
  onCreateLeftover: (mealPlan: MealPlan, recipe: Recipe) => void;
  onReorderMeals: (mealType: MealType, reorderedIds: string[]) => Promise<void>;
  copyWeek?: (sourceWeekKey: string, targetWeekKey: string) => Promise<void>;
}

export const MealPlannerContent = ({
  currentWeek,
  setCurrentWeek,
  isLoading,
  isDataLoading = false,
  currentMealPlans,
  allMealPlans = [],
  recipes,
  mealLayout,
  onMealLayoutChange,
  onRandomize,
  onShare,
  onClearAll,
  onAddMeal,
  onAddCustomMeal,
  onRemoveMeal,
  onCreateLeftover,
  onReorderMeals,
  copyWeek,
}: MealPlannerContentProps) => {
  const mealTypes: MealType[] = ["dinner", "lunch", "breakfast", "snacks", "sides", "desserts", "drinks"];

  // Pre-compute leftover relationships for O(1) lookup (Performance optimization)
  const leftoverMap = useMemo(() => {
    const map = new Map<string, MealPlan>();
    currentMealPlans.forEach(plan => {
      if (plan.parent_meal_plan_id && plan.is_leftover) {
        map.set(plan.parent_meal_plan_id, plan);
      }
    });
    console.log('[Performance] Leftover map computed:', map.size, 'leftovers');
    return map;
  }, [currentMealPlans]);

  const getMealPlansForType = useCallback((mealType: MealType): MealPlan[] => {
    return currentMealPlans
      .filter(plan => plan.meal_type === mealType)
      .sort((a, b) => {
        // Sort completed meals to the bottom
        if (a.is_completed !== b.is_completed) {
          return a.is_completed ? 1 : -1;
        }
        // Then sort by slot_index
        return (a.slot_index || 0) - (b.slot_index || 0);
      });
  }, [currentMealPlans]);

  // Performance: Memoize recipe lookup map for O(1) access instead of O(n)
  const recipeMap = useMemo(() => {
    const map = new Map<string, Recipe>();
    recipes.forEach(recipe => map.set(recipe.id, recipe));
    console.log('[Performance] Recipe map computed:', map.size, 'recipes');
    return map;
  }, [recipes]);

  const getRecipeById = useCallback((id: string): Recipe | undefined => {
    return recipeMap.get(id);
  }, [recipeMap]);

  return (
    <div className="space-y-3">
        {mealLayout === 'list' ? (
          <div className="space-y-3">
            {mealTypes.map((mealType, index) => (
          <MealListSection
            key={mealType}
            mealType={mealType}
            mealPlans={getMealPlansForType(mealType)}
            leftoverMap={leftoverMap}
            getRecipeById={getRecipeById}
            isDataLoading={isDataLoading}
            isGenerating={isLoading}
            onAddMeal={onAddMeal}
            onAddCustomMeal={onAddCustomMeal}
            onRemoveMeal={onRemoveMeal}
            onCreateLeftover={onCreateLeftover}
            onReorderMeals={onReorderMeals}
            sectionIndex={index}
          />
          ))}
        </div>
      ) : (
        <MealPlannerGridView
          currentMealPlans={currentMealPlans}
          recipes={recipes}
          mealLayout={mealLayout}
          isDataLoading={isDataLoading}
          isGenerating={isLoading}
          onAddMeal={onAddMeal}
          onAddCustomMeal={onAddCustomMeal}
          onRemoveMeal={onRemoveMeal}
          onCreateLeftover={onCreateLeftover}
          onReorderMeals={onReorderMeals}
        />
      )}
    </div>
  );
};
