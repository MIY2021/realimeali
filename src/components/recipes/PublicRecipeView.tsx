import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Recipe } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, Clock, Users, ExternalLink, Plus } from "lucide-react";

interface PublicRecipeViewProps {
  recipe: Recipe;
  sourceUrl?: string;
  sourceName?: string;
}

export function PublicRecipeView({ recipe, sourceUrl, sourceName }: PublicRecipeViewProps) {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { createRecipe } = useRecipes();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  const handleSaveToMyRecipes = async () => {
    if (!user || !currentHousehold || !recipe) return;
    
    setSaving(true);
    try {
      const newRecipe = {
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        image: recipe.image,
        isFavorite: false,
        householdId: currentHousehold.id,
      };

      const savedRecipe = await createRecipe(newRecipe, currentHousehold.id);
      
      if (savedRecipe) {
        toast({
          title: "Recipe Saved",
          description: `${recipe.title} has been added to your recipes.`,
        });
        setHasSaved(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleViewSource = () => {
    if (sourceUrl) {
      window.open(sourceUrl, '_blank');
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-4 sm:px-6 sm:py-8">
      <div className="space-y-6 sm:space-y-8">
        {/* Recipe Header */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Recipe Image */}
          {recipe.image && (
            <div className="lg:w-1/2">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full aspect-video object-cover rounded-lg"
              />
            </div>
          )}

          {/* Recipe Info */}
          <div className={`${recipe.image ? 'lg:w-1/2' : 'w-full'} space-y-4`}>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy leading-tight">
                {recipe.title}
              </h1>
              {recipe.description && (
                <p className="text-gray-600 mt-2 sm:mt-3 text-base sm:text-lg">
                  {recipe.description}
                </p>
              )}
            </div>

            {/* Classification Tags */}
            <div className="flex flex-wrap gap-2">
              {recipe.mealType && (
                <span className="inline-flex items-center rounded-full bg-sage/20 px-3 py-1 text-sm font-medium text-sage">
                  {recipe.mealType.replace('_', ' ')}
                </span>
              )}
              {recipe.cuisineRegion && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  {recipe.cuisineRegion.replace('_', ' ')}
                </span>
              )}
              {recipe.complexityLevel && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  {recipe.complexityLevel.replace('_', ' ')}
                </span>
              )}
            </div>

            {/* Recipe Stats */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-6 text-sm sm:text-base">
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-terracotta" />
                <span><strong>Prep:</strong> {recipe.prepTime}m</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-sage" />
                <span><strong>Cook:</strong> {recipe.cookTime}m</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-navy" />
                <span><strong>Serves:</strong> {recipe.servings}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-600" />
                <span><strong>Total:</strong> {recipe.prepTime + recipe.cookTime}m</span>
              </div>
            </div>

            {/* Source Info */}
            {sourceName && (
              <div className="text-sm text-gray-500">
                <span>Source: {sourceName}</span>
                {sourceUrl && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-blue-600"
                    onClick={handleViewSource}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Original
                  </Button>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2">
              {user && currentHousehold ? (
                hasSaved ? (
                  <div className="flex flex-col gap-2">
                    <div className="text-green-600 text-sm font-medium">
                      ✓ Added to your recipes
                    </div>
                    <Button
                      onClick={() => navigate('/my-recipes')}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      View My Recipes
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleSaveToMyRecipes}
                    className="w-full sm:w-auto bg-terracotta hover:bg-terracotta/90 text-white"
                    disabled={saving}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save to My Recipes'}
                  </Button>
                )
              ) : (
                <div className="text-sm text-gray-500">
                  Please log in to save this recipe to your collection.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recipe Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Ingredients */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-navy flex items-center">
              <ChefHat className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-sage" />
              Ingredients
            </h2>
            <div className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-sage rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">{ingredient}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-navy">Instructions</h2>
            <div className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-terracotta text-white text-sm sm:text-base font-bold rounded-full mr-3 sm:mr-4 flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 leading-relaxed">{instruction}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chef's Tip */}
        {recipe.topTip && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-lg">
                  <span className="text-amber-600 text-lg">💡</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-amber-800 mb-1">Chef's Tip</h3>
                <p className="text-amber-700">{recipe.topTip}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
