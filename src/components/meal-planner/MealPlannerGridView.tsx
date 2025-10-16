import { useCallback } from "react";
import { MealType, Recipe, MealPlan } from "@/types";
import { MealPlannerRecipeCard } from "@/components/meal-planner/MealPlannerRecipeCard";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Book, UtensilsCrossed, Search, Check, User } from "lucide-react";
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

  // Determine grid classes for meal cards based on layout preference
  const getMealCardGridClasses = () => {
    if (isMobile) {
      return mealLayout === '1' 
        ? 'grid grid-cols-1 gap-4 sm:gap-6'
        : 'grid grid-cols-2 gap-3 sm:gap-4';
    }
    // Default responsive layout for desktop
    return mealLayout === '1'
      ? 'grid grid-cols-1 gap-4 sm:gap-6'
      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6';
  };

  // Get meal type icon
  const getMealTypeIcon = (mealType: MealType) => {
    switch (mealType) {
      case 'breakfast': return Clock;
      case 'lunch': return Book;
      case 'dinner': return UtensilsCrossed;
      case 'snacks': return Plus;
      case 'drinks': return Search;
      case 'desserts': return Check;
      case 'sides': return User;
      default: return UtensilsCrossed;
    }
  };

  return (
    <div className="space-y-4 pt-2">
      {mealTypes.map((mealType, sectionIndex) => {
        const meals = getMealPlansForType(mealType);
        const Icon = getMealTypeIcon(mealType);
        
        return (
          <div key={mealType} className="space-y-3">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold capitalize text-navy">
                  {mealType}
                </h3>
                {meals.length > 0 && (
                  <span className="text-sm text-grey-light">
                    ({meals.length})
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onAddMeal(mealType)}
                className="h-6 w-6 rounded-full bg-[#F5B82E]/70 hover:bg-[#F5B82E]/90 p-0"
              >
                <Plus className="h-3 w-3 text-white" />
              </Button>
            </div>

            {/* Meals Grid */}
            {meals.length === 0 ? (
              <div className="border border-dashed border-gray-200 rounded-lg p-4 text-center text-grey-light">
                <span className="text-sm">No {mealType} planned yet</span>
              </div>
            ) : (
              <div className={getMealCardGridClasses()}>
                {meals.map((meal, index) => (
                  <MealPlannerRecipeCard
                    key={meal.id}
                    mealPlan={meal}
                    recipe={getRecipeById(meal.recipe_id)}
                    onRemove={onRemoveMeal}
                    onCreateLeftover={onCreateLeftover}
                    animationDelay={(sectionIndex * 100) + (index * 50)}
                    allMealPlans={currentMealPlans}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};