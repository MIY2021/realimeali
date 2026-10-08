import { MealPlannerGridView } from "@/components/meal-planner/MealPlannerGridView";
import { MealType, Recipe, MealPlan } from "@/types";

interface MealPlannerContentProps {
  currentWeek: string;
  setCurrentWeek: (week: string) => void;
  isLoading: boolean;
  isDataLoading?: boolean;
  currentMealPlans: MealPlan[];
  allMealPlans?: MealPlan[];
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
  currentMealPlans,
  recipes,
  isDataLoading = false,
  isLoading,
  onAddMeal,
  onAddCustomMeal,
  onRemoveMeal,
  onCreateLeftover,
}: MealPlannerContentProps) => {
  return (
    <div>
      <MealPlannerGridView
        currentMealPlans={currentMealPlans}
        recipes={recipes}
        mealLayout="grid"
        isDataLoading={isDataLoading}
        isGenerating={isLoading}
        onAddMeal={onAddMeal}
        onAddCustomMeal={onAddCustomMeal}
        onRemoveMeal={onRemoveMeal}
        onCreateLeftover={onCreateLeftover}
        onReorderMeals={onReorderMeals}
      />
    </div>
  );
};
