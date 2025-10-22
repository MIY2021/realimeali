import { useCallback, useMemo } from "react";
import { MealPlannerActions } from "@/components/meal-planner/MealPlannerActions";
import { MealPlannerGridView } from "@/components/meal-planner/MealPlannerGridView";
import MealListSection from "@/components/MealListSection";
import { MealType, Recipe, MealPlan } from "@/types";

interface MealPlannerContentProps {
  currentWeek: 1 | 2;
  setCurrentWeek: (week: 1 | 2) => void;
  isLoading: boolean;
  currentMealPlans: MealPlan[];
  mostRecentWeek: 1 | 2 | null;
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
  onReorderMeals: (mealType: MealType, sourceIndex: number, destinationIndex: number) => Promise<void>;
}

export const MealPlannerContent = ({
  currentWeek,
  setCurrentWeek,
  isLoading,
  currentMealPlans,
  mostRecentWeek,
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
        mostRecentWeek={mostRecentWeek}
        mealLayout={mealLayout}
        onMealLayoutChange={onMealLayoutChange}
      />

      {mealLayout === 'list' ? (
        <div className="space-y-3">
          {mealTypes.map((mealType, index) => (
          <MealListSection
            key={mealType}
            mealType={mealType}
            mealPlans={getMealPlansForType(mealType)}
            leftoverMap={leftoverMap}
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
      ) : (
        <MealPlannerGridView
          currentMealPlans={currentMealPlans}
          recipes={recipes}
          mealLayout={mealLayout}
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
