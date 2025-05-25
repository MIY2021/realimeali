
import { MealType, MealPlan, Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EnhancedMealCard } from "@/components/meal-planner/EnhancedMealCard";

interface MealListSectionProps {
  mealType: MealType;
  mealPlans: MealPlan[];
  getRecipeById: (id: string) => Recipe | undefined;
  onAddMeal: (mealType: MealType) => void;
  onRemoveMeal: (planId: string) => void;
}

export default function MealListSection({
  mealType,
  mealPlans,
  getRecipeById,
  onAddMeal,
  onRemoveMeal,
}: MealListSectionProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold capitalize text-navy">
          {mealType}
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onAddMeal(mealType)}
          className="text-terracotta border-terracotta hover:bg-terracotta/10"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {mealPlans.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-md p-4 text-center text-muted-foreground">
          No {mealType} planned yet
        </div>
      ) : (
        <div className="space-y-2">
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
                parentRecipe={parentRecipe}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
