import { useCallback } from "react";
import { MealType, Recipe, MealPlan } from "@/types";
import { EnhancedMealCard } from "@/components/meal-planner/EnhancedMealCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MealPlannerGridViewProps {
  currentMealPlans: MealPlan[];
  recipes: Recipe[];
  mealLayout: string;
  onAddMeal: (mealType: MealType) => void;
  onAddCustomMeal: (mealType: MealType) => void;
  onRemoveMeal: (planId: string) => void;
  onCreateLeftover: (mealPlan: MealPlan, recipe: Recipe) => void;
  onReorderMeals: (mealType: MealType, sourceIndex: number, destinationIndex: number) => Promise<void>;
}

export const MealPlannerGridView = ({
  currentMealPlans,
  recipes,
  mealLayout,
  onAddMeal,
  onAddCustomMeal,
  onRemoveMeal,
  onCreateLeftover,
  onReorderMeals,
}: MealPlannerGridViewProps) => {
  const isMobile = useIsMobile();
  const mealTypes: MealType[] = ["dinner", "lunch", "breakfast", "snacks", "sides", "desserts", "drinks"];

  const getMealPlansForType = useCallback((mealType: MealType): MealPlan[] => {
    return currentMealPlans
      .filter(plan => plan.meal_type === mealType)
      .sort((a, b) => (a.slot_index || 0) - (b.slot_index || 0));
  }, [currentMealPlans]);

  const getRecipeById = useCallback((id: string): Recipe | undefined => {
    return recipes.find(recipe => recipe.id === id);
  }, [recipes]);

  // Determine grid classes based on layout preference
  const getGridClasses = () => {
    if (mealLayout === '1') {
      return 'grid grid-cols-1 gap-4 sm:gap-6';
    } else if (mealLayout === '2') {
      return 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4';
    }
    // Default fallback (shouldn't be reached in grid view)
    return 'grid grid-cols-1 gap-4 sm:gap-6';
  };

  // Get all meals for grid view
  const getAllMeals = () => {
    return mealTypes.flatMap(mealType => {
      const meals = getMealPlansForType(mealType);
      return meals.map(meal => ({
        ...meal,
        mealType,
        recipe: getRecipeById(meal.recipe_id)
      }));
    });
  };

  const allMeals = getAllMeals();

  return (
    <div className="space-y-4">
      {/* Add meal buttons for each type */}
      <div className="flex flex-wrap gap-2 mb-4">
        {mealTypes.map((mealType) => (
          <Button
            key={mealType}
            size="sm"
            variant="outline"
            onClick={() => onAddMeal(mealType)}
            className="text-terracotta border-terracotta hover:bg-terracotta/10 capitalize"
          >
            <Plus className="h-3 w-3 mr-1" />
            {mealType}
          </Button>
        ))}
      </div>

      {/* Grid of meals */}
      {allMeals.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-md p-8 text-center text-muted-foreground">
          <span>No meals planned yet. Add some meals to get started!</span>
        </div>
      ) : (
        <div className={getGridClasses()}>
          {allMeals.map((meal, index) => (
            <div key={meal.id} className="relative">
              {/* Meal type badge */}
              <div className="absolute -top-2 left-2 z-10">
                <span className="bg-sage text-white text-xs px-2 py-1 rounded-full capitalize font-medium">
                  {meal.mealType}
                </span>
              </div>
              <EnhancedMealCard
                mealPlan={meal}
                recipe={meal.recipe}
                onRemove={onRemoveMeal}
                onCreateLeftover={onCreateLeftover}
                dragHandleProps={null}
                animationDelay={index * 50}
                allMealPlans={currentMealPlans}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};