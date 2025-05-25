
import { MealType, MealPlan, Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EnhancedMealCard } from "@/components/meal-planner/EnhancedMealCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface MealListSectionProps {
  mealType: MealType;
  mealPlans: MealPlan[];
  getRecipeById: (id: string) => Recipe | undefined;
  onAddMeal: (mealType: MealType) => void;
  onRemoveMeal: (planId: string) => void;
  onCreateLeftover?: (mealPlan: MealPlan, recipe: Recipe) => void;
}

export default function MealListSection({
  mealType,
  mealPlans,
  getRecipeById,
  onAddMeal,
  onRemoveMeal,
  onCreateLeftover,
}: MealListSectionProps) {
  const isMobile = useIsMobile();

  return (
    <div className={`mb-${isMobile ? '4' : '6'}`}>
      <div className={`flex items-center justify-between mb-3 ${isMobile ? 'px-1' : ''}`}>
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold capitalize text-navy`}>
          {mealType}
        </h3>
        <Button
          size={isMobile ? "sm" : "sm"}
          variant="outline"
          onClick={() => onAddMeal(mealType)}
          className={`text-terracotta border-terracotta hover:bg-terracotta/10 ${isMobile ? 'h-8 px-2 text-xs' : ''}`}
        >
          <Plus className={`${isMobile ? 'h-3 w-3 mr-0.5' : 'h-4 w-4 mr-1'}`} />
          Add
        </Button>
      </div>

      {mealPlans.length === 0 ? (
        <div className={`border border-dashed border-gray-300 rounded-md ${isMobile ? 'p-3' : 'p-4'} text-center text-muted-foreground`}>
          <span className={`${isMobile ? 'text-sm' : ''}`}>No {mealType} planned yet</span>
        </div>
      ) : (
        <div className={`space-y-${isMobile ? '1.5' : '2'}`}>
          {mealPlans.map((plan) => {
            const recipe = getRecipeById(plan.recipeId);
            
            // For leftover meals, get the parent recipe if the current recipe is not found
            const parentRecipe = plan.isLeftover && plan.parentMealPlanId 
              ? getRecipeById(plan.recipeId) 
              : undefined;

            return (
              <EnhancedMealCard
                key={plan.id}
                mealPlan={plan}
                recipe={recipe}
                onRemove={onRemoveMeal}
                onCreateLeftover={onCreateLeftover}
                parentRecipe={parentRecipe}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
