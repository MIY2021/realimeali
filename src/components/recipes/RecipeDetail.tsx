
import { Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, ChefHat, Lightbulb, Plus, Pencil, Trash2, Share } from "lucide-react";
import { RecipeImage } from "@/components/ui/recipe-image";
import { getDisplayLabel, getIcon } from "@/utils/recipeClassification";

interface RecipeDetailProps {
  recipe: Recipe;
  onAddToMealPlan?: (recipe: Recipe) => void;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: () => void;
  isOwner?: boolean;
}

export function RecipeDetail({ recipe, onAddToMealPlan, onEdit, onDelete, isOwner }: RecipeDetailProps) {
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-4 sm:px-6 sm:py-8">
      <div className="space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Recipe Image */}
          <div className="lg:w-1/2">
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
              <RecipeImage recipe={recipe} className="w-full h-full" iconSize="h-16 w-16" />
            </div>
          </div>

          {/* Recipe Info */}
          <div className="lg:w-1/2 space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy mb-3">
                {recipe.title}
              </h1>
              
              {/* Classification badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {recipe.mealType && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-sm font-medium">
                    <span>{getIcon(recipe.mealType, 'mealType')}</span>
                    <span>{getDisplayLabel(recipe.mealType, 'mealType')}</span>
                  </span>
                )}
                {recipe.complexityLevel && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-800 px-3 py-1 text-sm font-medium">
                    <span>{getIcon(recipe.complexityLevel, 'complexityLevel')}</span>
                    <span>{getDisplayLabel(recipe.complexityLevel, 'complexityLevel')}</span>
                  </span>
                )}
                {recipe.cuisineRegion && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-purple-800 px-3 py-1 text-sm font-medium">
                    <span>{getIcon(recipe.cuisineRegion, 'cuisineRegion')}</span>
                    <span>{getDisplayLabel(recipe.cuisineRegion, 'cuisineRegion')}</span>
                  </span>
                )}
                {recipe.cookingMethod && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-800 px-3 py-1 text-sm font-medium">
                    <span>{getIcon(recipe.cookingMethod, 'cookingMethod')}</span>
                    <span>{getDisplayLabel(recipe.cookingMethod, 'cookingMethod')}</span>
                  </span>
                )}
              </div>
            </div>

            {recipe.description && (
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {recipe.description}
              </p>
            )}

            {/* Recipe Stats */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-6 py-4 border-y border-gray-200">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-terracotta" />
                <div>
                  <div className="text-sm font-medium">Prep Time</div>
                  <div className="text-sm text-muted-foreground">{recipe.prepTime} min</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-terracotta" />
                <div>
                  <div className="text-sm font-medium">Cook Time</div>
                  <div className="text-sm text-muted-foreground">{recipe.cookTime} min</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-terracotta" />
                <div>
                  <div className="text-sm font-medium">Total Time</div>
                  <div className="text-sm text-muted-foreground">{totalTime} min</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-terracotta" />
                <div>
                  <div className="text-sm font-medium">Servings</div>
                  <div className="text-sm text-muted-foreground">{recipe.servings}</div>
                </div>
              </div>
            </div>

            {/* Diet & Lifestyle tags */}
            {recipe.dietLifestyle && recipe.dietLifestyle.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Diet & Lifestyle</h3>
                <div className="flex flex-wrap gap-1">
                  {recipe.dietLifestyle.map((lifestyle) => (
                    <span
                      key={lifestyle}
                      className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2 py-1 text-xs font-medium"
                    >
                      <span>{getIcon(lifestyle, 'dietLifestyle')}</span>
                      <span>{getDisplayLabel(lifestyle, 'dietLifestyle')}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {onAddToMealPlan && (
                <Button 
                  onClick={() => onAddToMealPlan(recipe)}
                  className="w-full sm:w-auto bg-terracotta hover:bg-terracotta/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Meal Plan
                </Button>
              )}
              
              {isOwner && (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  {onEdit && (
                    <Button
                      variant="outline"
                      onClick={() => onEdit(recipe)}
                      className="w-full sm:w-auto"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={() => {/* Handle share */}}
                    className="w-full sm:w-auto"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  
                  {onDelete && (
                    <Button
                      variant="outline"
                      onClick={onDelete}
                      className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recipe Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Ingredients */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-navy">Ingredients</h2>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <ul className="space-y-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-terracotta rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-navy">Instructions</h2>
            <div className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <Card key={index}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex gap-4">
                      <span className="w-8 h-8 bg-terracotta text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </span>
                      <p className="text-sm sm:text-base leading-relaxed">{instruction}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Chef's Tip */}
        {recipe.topTip && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex gap-3">
                <Lightbulb className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-2">Chef's Tip</h3>
                  <p className="text-yellow-800 text-sm sm:text-base">{recipe.topTip}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
