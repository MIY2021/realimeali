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
  onRemoveMeal,
  onCreateLeftover,
}: MealPlannerContentProps) => {
  const cookedCount = currentMealPlans.filter(plan => plan.is_completed).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="px-1">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Your meals
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {isDataLoading
            ? "Loading your week…"
            : `${currentMealPlans.length} ${currentMealPlans.length === 1 ? "meal" : "meals"} planned${cookedCount > 0 ? ` · ${cookedCount} cooked` : ""}`}
        </p>
      </div>

      <MealPlannerGridView
        currentMealPlans={currentMealPlans}
        recipes={recipes}
        mealLayout="grid"
        isDataLoading={isDataLoading}
        isGenerating={isLoading}
        onAddMeal={onAddMeal}
        onAddCustomMeal={() => undefined}
        onRemoveMeal={onRemoveMeal}
        onCreateLeftover={onCreateLeftover}
        onReorderMeals={() => Promise.resolve()}
      />
    </div>
  );
};
