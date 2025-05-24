
import { MealPlan, MealType, Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MealCard } from "./meal-planner/MealCard";

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
  const mealTypeLabels = {
    dinner: "Dinners",
    lunch: "Lunches", 
    breakfast: "Breakfasts",
    snacks: "Snacks"
  };

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-navy capitalize">
          {mealTypeLabels[mealType]} ({mealPlans.length})
        </h3>
        <Button
          onClick={() => onAddMeal(mealType)}
          size="sm"
          variant="outline"
          className="h-8 px-3"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      
      <div className="space-y-2">
        {mealPlans.length > 0 ? (
          mealPlans.map((plan) => {
            const recipe = getRecipeById(plan.recipeId);
            return recipe ? (
              <MealCard
                key={plan.id}
                recipe={recipe}
                onRemove={() => onRemoveMeal(plan.id)}
              />
            ) : (
              <div key={plan.id} className="p-3 border rounded-lg bg-destructive/10">
                <span className="text-sm text-muted-foreground">Recipe not found</span>
                <Button
                  onClick={() => onRemoveMeal(plan.id)}
                  size="sm"
                  variant="outline"
                  className="ml-2 h-6 px-2 text-xs"
                >
                  Remove
                </Button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4 border-2 border-dashed border-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">No {mealTypeLabels[mealType].toLowerCase()} planned</p>
            <Button
              onClick={() => onAddMeal(mealType)}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add {mealType}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
