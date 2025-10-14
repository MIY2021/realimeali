import { useState, useEffect } from "react";
import { Recipe } from "@/types";
import { RecipeHeader } from "./RecipeHeader";
import { RecipeMetaInfo } from "./RecipeMetaInfo";
import { RecipeTabContent } from "./RecipeTabContent";
import { RecipeImageEditor } from "./RecipeImageEditor";
import { RecipeNotesSection } from "./RecipeNotesSection";
import { RecipeClassificationSummary } from "./RecipeClassificationSummary";
import { RecipeInfoDialog } from "./RecipeInfoDialog";
import { DrinkPairingCard } from "./DrinkPairingCard";
import { AskRealiChefButton } from "./AskRealiChefButton";

import { Clock, Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipeScalingService } from "@/utils/recipeScaling";
import { Card, CardContent } from "@/components/ui/card";
import { useRecipes } from "@/contexts/RecipesContext";
import { toast } from "sonner";

interface RecipeDetailProps {
  recipe: Recipe;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: () => Promise<void>;
  isOwner?: boolean;
  onAddToMealPlan?: (adjustedServings?: number) => void;
  onImageUpdate?: (imageUrl: string) => void;
}

export const RecipeDetail = ({ 
  recipe, 
  onEdit, 
  onDelete, 
  isOwner, 
  onAddToMealPlan,
  onImageUpdate
}: RecipeDetailProps) => {
  const [currentServings, setCurrentServings] = useState(recipe.servings);
  const [scaledIngredients, setScaledIngredients] = useState<string[]>(recipe.ingredients);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showRecipeInfo, setShowRecipeInfo] = useState(false);
  const { toggleFavorite, toggleCookingStatus } = useRecipes();

  // Load saved servings from localStorage on mount
  useEffect(() => {
    const savedServings = localStorage.getItem(`recipe-servings-${recipe.id}`);
    if (savedServings) {
      const servings = parseInt(savedServings, 10);
      if (servings > 0) {
        setCurrentServings(servings);
        const scaled = RecipeScalingService.scaleIngredients(
          recipe.ingredients, 
          recipe.servings, 
          servings
        );
        setScaledIngredients(scaled);
      }
    }
  }, [recipe.id, recipe.ingredients, recipe.servings]);

  const handleServingsChange = (newServings: number) => {
    setCurrentServings(newServings);
    localStorage.setItem(`recipe-servings-${recipe.id}`, newServings.toString());
    const scaled = RecipeScalingService.scaleIngredients(
      recipe.ingredients, 
      recipe.servings, 
      newServings
    );
    setScaledIngredients(scaled);
  };

  const handleServingsReset = () => {
    setCurrentServings(recipe.servings);
    localStorage.removeItem(`recipe-servings-${recipe.id}`);
    setScaledIngredients(recipe.ingredients);
  };

  const handleAddToMealPlan = () => {
    onAddToMealPlan?.(currentServings);
  };

  const handleImageUpdate = (imageUrl: string) => {
    onImageUpdate?.(imageUrl);
    setShowImageEditor(false);
  };

  const handleToggleFavorite = async () => {
    try {
      const newFavoriteStatus = !recipe.is_favorite;
      await toggleFavorite(recipe.id, newFavoriteStatus);
      
      if (newFavoriteStatus) {
        toast.success("Added to favorites", {
          description: `${recipe.title} has been added to your favorites`
        });
      } else {
        toast.success("Removed from favorites", {
          description: `${recipe.title} has been removed from your favorites`
        });
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast.error("Failed to update favorite status");
    }
  };

  const handleToggleCooked = async () => {
    try {
      await toggleCookingStatus(recipe.id);
    } catch (error) {
      console.error('Failed to toggle cooked status:', error);
      toast.error("Failed to update cooked status");
    }
  };

  const isScaled = currentServings !== recipe.servings;

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);


  return (
    <div className="w-full max-w-4xl mx-auto px-0">
      {/* Hero Header with Image and Actions */}
      <RecipeHeader
        recipe={recipe}
        isOwner={isOwner}
        isFavorite={recipe.is_favorite}
        isCooked={recipe.has_cooked}
        onToggleFavorite={handleToggleFavorite}
        onToggleCooked={handleToggleCooked}
        onEdit={() => onEdit?.(recipe)}
        onDelete={onDelete}
        onInfoClick={() => setShowRecipeInfo(true)}
      />

      {/* Description */}
      {recipe.description && (
        <div className="mb-4 px-2">
          <p className="text-gray-600 leading-relaxed">{recipe.description}</p>
        </div>
      )}

      {/* Time Info Section */}
      {(recipe.prep_time || recipe.cook_time) && (
        <div className="mb-6 px-2">
          <div className="border-t border-gray-200 pt-4 pb-4 border-b">
            <div className="flex items-center justify-start gap-8">
              {recipe.prep_time && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600">Prep: {recipe.prep_time} min</span>
                </div>
              )}
              {recipe.cook_time && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600">Cook: {recipe.cook_time} min</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recipe Classification Summary (Category badges) */}
      <div className="mb-6">
        <RecipeClassificationSummary recipe={recipe} />
      </div>

      {/* Add to Meal Plan Button - Prominent Position */}
      <div className="mb-6 px-2">
        <Button 
          onClick={handleAddToMealPlan}
          className="bg-terracotta hover:bg-terracotta/90 text-white w-full py-6 rounded-lg shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add to Meal Plan
        </Button>
      </div>

      {/* Top Tip - only show if it exists */}
      {recipe.top_tip && recipe.top_tip !== "Enjoy cooking this delicious recipe!" && (
        <Card className="mb-6 bg-sage/10 border-sage/20 shadow-sm">
          <CardContent className="p-5">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-8 w-8 rounded-full bg-sage/20 flex items-center justify-center">
                  <span className="text-lg">💡</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sage mb-1">Top Tip</h3>
                <p className="text-sm text-gray-700">{recipe.top_tip}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drink Pairing Card */}
      <DrinkPairingCard recipeId={recipe.id} />

      {/* Recipe Notes */}
      <div className="mb-6">
        <RecipeNotesSection recipeId={recipe.id} />
      </div>

      {/* Ask RealiChef Button - Fixed Inline */}
      <AskRealiChefButton />

      {/* Servings Controller */}
      <div className="mb-4 px-2">
        <RecipeMetaInfo
          recipe={recipe}
          onServingsChange={handleServingsChange}
          currentServings={currentServings}
        />
      </div>

      {/* Tabbed Content - Ingredients, Equipment, Instructions */}
      <div className="mb-6">
        <RecipeTabContent
          recipe={recipe}
          scaledIngredients={scaledIngredients}
          isScaled={isScaled}
        />
      </div>

      

      {/* Recipe Info Dialog */}
      <RecipeInfoDialog
        open={showRecipeInfo}
        onOpenChange={setShowRecipeInfo}
        sourceUrl={recipe.source_url}
        importMethod={recipe.import_method}
        createdBy={recipe.created_by}
        createdAt={recipe.created_at}
        updatedAt={recipe.updated_at}
        lastUpdatedBy={recipe.last_updated_by}
      />

      {/* Image Editor Dialog */}
      {showImageEditor && isOwner && (
        <RecipeImageEditor
          recipe={recipe}
          isOpen={showImageEditor}
          onClose={() => setShowImageEditor(false)}
          onImageUpdate={handleImageUpdate}
        />
      )}
    </div>
  );
};
