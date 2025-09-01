import { useCallback } from "react";
import { MealType, Recipe, MealPlan } from "@/types";
import { EnhancedMealCard } from "@/components/meal-planner/EnhancedMealCard";
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
    <div className="space-y-6">
      {mealTypes.map((mealType, sectionIndex) => {
        const meals = getMealPlansForType(mealType);
        const Icon = getMealTypeIcon(mealType);
        
        return (
          <div key={mealType} className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-sage" />
                <h3 className="text-lg font-semibold capitalize text-navy">
                  {mealType}
                </h3>
                {meals.length > 0 && (
                  <span className="text-sm text-muted-foreground bg-gray-100 px-2 py-1 rounded-full">
                    {meals.length} meal{meals.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAddMeal(mealType)}
                className="text-terracotta border-terracotta hover:bg-terracotta/10"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>

            {/* Meals Grid */}
            {meals.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-md p-4 text-center text-muted-foreground">
                <span className="text-sm">No {mealType} planned yet</span>
              </div>
            ) : (
              <div className={getMealCardGridClasses()}>
                {meals.map((meal, index) => (
                  <EnhancedMealCard
                    key={meal.id}
                    mealPlan={meal}
                    recipe={getRecipeById(meal.recipe_id)}
                    onRemove={onRemoveMeal}
                    onCreateLeftover={onCreateLeftover}
                    dragHandleProps={null}
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