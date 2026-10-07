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
  onReorderMeals: (mealType: MealType, reorderedIds: string[]) => Promise<void>;
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

  const meals = [...currentMealPlans].sort((a, b) => {
    if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
    return (a.slot_index || 0) - (b.slot_index || 0);
  });

  const handleAddMeal = () => onAddMeal("dinner");

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

  if (isGenerating && meals.length === 0) {
    return <MealGenerationLoading mealType="dinner" />;
  }

  return (
    <div className="space-y-5">
      {meals.length > 0 && (
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
      )}

      <Button
        variant="outline"
        onClick={handleAddMeal}
        className="group w-full rounded-2xl border-2 border-dashed py-7 text-muted-foreground hover:border-[#F5B82E] hover:bg-[#F5B82E]/5 hover:text-navy"
      >
        <span className="mr-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#F5B82E]/15 group-hover:bg-[#F5B82E]/25">
          <Plus className="h-5 w-5 text-[#D99B16]" />
        </span>
        <span className="font-semibold">
          {meals.length === 0 ? "Add your first meal" : "Add another meal"}
        </span>
      </Button>

      {meals.length === 0 && (
        <p className="px-4 text-center text-sm text-muted-foreground">
          Pick a few meals you might fancy this week. There’s no need to decide which day they’re for.
        </p>
      )}
    </div>
  );
};
