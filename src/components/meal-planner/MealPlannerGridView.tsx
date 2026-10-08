import { MealType, Recipe, MealPlan } from "@/types";
import { MealPlannerRecipeCard } from "@/components/meal-planner/MealPlannerRecipeCard";
import { MealSectionSkeleton } from "@/components/meal-planner/MealSectionSkeleton";
import { MealGenerationLoading } from "@/components/meal-planner/MealGenerationLoading";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface MealPlannerGridViewProps {
  currentMealPlans: MealPlan[];
  recipes: Recipe[];
  mealLayout: string;
  isDataLoading?: boolean;
  isGenerating?: boolean;
  onAddMeal: (mealType: MealType) => void;
  onAddCustomMeal: (mealType: MealType) => void;
  onRemoveMeal: (planId: string) => void;
  onCreateLeftover: (mealPlan: MealPlan, recipe: Recipe) => void;
}

export const MealPlannerGridView = ({
  currentMealPlans,
  recipes,
  isDataLoading = false,
  isGenerating = false,
  onAddMeal,
  onRemoveMeal,
  onCreateLeftover,
}: MealPlannerGridViewProps) => {
  const recipeMap = new Map(recipes.map(recipe => [recipe.id, recipe]));
  const mealTypes: MealType[] = ["dinner", "lunch", "breakfast", "snacks", "sides", "desserts", "drinks"];

  const getMeals = (mealType: MealType) =>
    currentMealPlans
      .filter(meal => meal.meal_type === mealType)
      .sort((a, b) => {
        if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
        return (a.slot_index || 0) - (b.slot_index || 0);
      });

  if (isDataLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="overflow-hidden rounded-2xl border bg-card">
            <MealSectionSkeleton count={1} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {mealTypes.map(mealType => {
        const meals = getMeals(mealType);
        if (meals.length === 0 && !["dinner", "lunch", "breakfast"].includes(mealType)) return null;

        return (
          <section key={mealType} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-xl font-bold capitalize tracking-tight text-navy sm:text-2xl">
                  {mealType}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {meals.length === 0 ? "Nothing planned yet" : `${meals.length} ${meals.length === 1 ? "option" : "options"}`}
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => onAddMeal(mealType)}
                className="h-9 w-9 rounded-full bg-[#F5B82E]/15 p-0 hover:bg-[#F5B82E]/25"
                aria-label={`Add ${mealType}`}
              >
                <Plus className="h-5 w-5 text-[#D99B16]" />
              </Button>
            </div>

            {isGenerating && meals.length === 0 ? (
              <MealGenerationLoading mealType={mealType} />
            ) : meals.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5">
                {meals.map(meal => (
                  <MealPlannerRecipeCard
                    key={meal.id}
                    mealPlan={meal}
                    recipe={recipeMap.get(meal.recipe_id)}
                    onRemove={onRemoveMeal}
                    onCreateLeftover={onCreateLeftover}
                    allMealPlans={currentMealPlans}
                  />
                ))}
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => onAddMeal(mealType)}
                className="w-full rounded-2xl border-2 border-dashed py-6 text-muted-foreground hover:border-[#F5B82E] hover:bg-[#F5B82E]/5 hover:text-navy"
              >
                <span className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#F5B82E]/15">
                  <Plus className="h-4 w-4 text-[#D99B16]" />
                </span>
                Add {mealType}
              </Button>
            )}
          </section>
        );
      })}
    </div>
  );
};
