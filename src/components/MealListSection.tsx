
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trash2, Plus } from "lucide-react";
import { MealPlan, MealType } from "@/types";
import { Recipe } from "@/types";

type Props = {
  mealType: MealType;
  mealPlans: MealPlan[];
  getRecipeById: (id: string) => Recipe | undefined;
  onAddMeal: (mealType: MealType) => void;
  onRemoveMeal: (planId: string) => void;
};
export default function MealListSection({
  mealType,
  mealPlans,
  getRecipeById,
  onAddMeal,
  onRemoveMeal
}: Props) {
  return (
    <div>
      <div className="flex items-center mb-1">
        <h2 className="text-lg font-semibold text-navy capitalize flex-1">{mealType}</h2>
        <Button
          size="icon"
          variant="ghost"
          className="ml-2"
          onClick={() => onAddMeal(mealType)}
          title="Add meal"
        >
          <Plus className="h-5 w-5 text-navy" />
          <span className="sr-only">Add {mealType}</span>
        </Button>
      </div>
      <ul className="space-y-2 mb-6">
        {mealPlans.map((plan) => {
          const recipe = getRecipeById(plan.recipeId);
          return (
            <li key={plan.id} className="flex items-center justify-between bg-white rounded p-2 shadow">
              <Link
                to={`/recipes/${plan.recipeId}`}
                className="font-medium flex-1 hover:underline"
              >
                {recipe ? recipe.title : "Unknown"}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 p-0 text-muted-foreground"
                onClick={() => onRemoveMeal(plan.id)}
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
