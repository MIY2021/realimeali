
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trash2, Plus } from "lucide-react";
import { MealPlan, MealType } from "@/types";
import { Recipe } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";

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
  const [completedMeals, setCompletedMeals] = useState<Record<string, boolean>>({});
  
  // Load completed state from localStorage
  useEffect(() => {
    const storedCompletedMeals = localStorage.getItem(`completed_meals_${mealType}`);
    if (storedCompletedMeals) {
      setCompletedMeals(JSON.parse(storedCompletedMeals));
    }
  }, [mealType]);
  
  // Save completed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(`completed_meals_${mealType}`, JSON.stringify(completedMeals));
  }, [completedMeals, mealType]);
  
  const toggleMealCompleted = (planId: string) => {
    setCompletedMeals(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

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
          const isCompleted = completedMeals[plan.id] || false;
          
          return (
            <li key={plan.id} className="flex items-center justify-between bg-white rounded p-2 shadow">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id={`meal-${plan.id}`}
                  checked={isCompleted}
                  onCheckedChange={() => toggleMealCompleted(plan.id)}
                />
                <Link
                  to={`/recipes/${plan.recipeId}`}
                  className={`font-medium hover:underline ${isCompleted ? 'line-through text-muted-foreground' : ''}`}
                >
                  {recipe ? recipe.title : "Unknown"}
                </Link>
              </div>
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
