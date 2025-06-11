import { WeekSelector } from "@/components/meal-planner/WeekSelector";
import { MealPlannerActions } from "@/components/meal-planner/MealPlannerActions";
import { MealPlannerDragAndDrop } from "@/components/meal-planner/MealPlannerDragAndDrop";

interface MealPlannerContentProps {
  currentWeek: 1 | 2;
  setCurrentWeek: (week: 1 | 2) => void;
  isLoading: boolean;
  currentMealPlans: any[];
  recipes: any[];
  onRandomize: () => void;
  onShare: () => void;
  onClearAll: () => void;
  onAddMeal: (mealType: any) => void;
  onRemoveMeal: (planId: string) => void;
  onCreateLeftover: (mealPlan: any, recipe: any) => void;
  onUpdateServings: (mealPlanId: string, newServings: number) => Promise<void>;
  onReorderMeals: (mealType: any, sourceIndex: number, destinationIndex: number) => void;
}

export function MealPlannerContent({
  currentWeek,
  setCurrentWeek,
  isLoading,
  currentMealPlans,
  recipes,
  onRandomize,
  onShare,
  onClearAll,
  onAddMeal,
  onRemoveMeal,
  onCreateLeftover,
  onUpdateServings,
  onReorderMeals,
}: MealPlannerContentProps) {
  const getRecipeById = (id: string) => {
    return recipes.find((recipe) => recipe.id === id);
  };

  return (
    <>
      <WeekSelector currentWeek={currentWeek} setCurrentWeek={setCurrentWeek} />
      <MealPlannerActions onRandomize={onRandomize} onShare={onShare} onClearAll={onClearAll} />

      {isLoading ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground mb-4">Loading meal plans...</p>
        </div>
      ) : (
        <MealPlannerDragAndDrop
          currentMealPlans={currentMealPlans}
          getRecipeById={getRecipeById}
          onAddMeal={onAddMeal}
          onRemoveMeal={onRemoveMeal}
          onCreateLeftover={onCreateLeftover}
          onUpdateServings={onUpdateServings}
          onReorderMeals={onReorderMeals}
        />
      )}
    </>
  );
}
