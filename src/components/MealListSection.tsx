
import { MealType, MealPlan, Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { RecipeImage } from "@/components/ui/recipe-image";

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
  // Create URL-friendly slug from recipe title
  const createSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const getRecipeUrl = (recipe: Recipe) => {
    const recipeSlug = createSlug(recipe.title);
    return `/recipes/${recipe.id}/${recipeSlug}`;
  };

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
            return (
              <div
                key={plan.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border"
              >
                {/* Recipe thumbnail */}
                <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  <RecipeImage recipe={recipe} className="w-full h-full" iconSize="h-4 w-4" />
                </div>

                <div className="flex-1">
                  {recipe ? (
                    <Link 
                      to={getRecipeUrl(recipe)}
                      className="text-sm font-medium hover:text-terracotta transition-colors block"
                    >
                      {recipe.title}
                    </Link>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Recipe not found
                    </span>
                  )}
                  {recipe && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {recipe.prepTime + recipe.cookTime} min
                      </span>
                      <span className="text-xs text-muted-foreground">
                        • {recipe.servings} servings
                      </span>
                    </div>
                  )}
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveMeal(plan.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
