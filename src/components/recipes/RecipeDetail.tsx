import { useState, useEffect } from "react";
import { Recipe } from "@/types";
import { RecipeHeader } from "./RecipeHeader";
import { RecipeMetaInfo } from "./RecipeMetaInfo";
import { RecipeTabContent } from "./RecipeTabContent";
import { RecipeImageEditor } from "./RecipeImageEditor";
import { RecipeClassificationSummary } from "./RecipeClassificationSummary";
import { RecipeInfoDialog } from "./RecipeInfoDialog";
import { ChefsInsightCard } from "./ChefsInsightCard";

import { Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipeScalingService } from "@/utils/recipeScaling";
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
        onAddToMealPlan={handleAddToMealPlan}
      />

      {/* Description */}
      {recipe.description && (
        <div className="mb-4 px-2">
          <p className="text-content-secondary leading-relaxed">{recipe.description}</p>
        </div>
      )}

      {/* Time Info Section */}
      {(recipe.prep_time || recipe.cook_time) && (
        <div className="mb-6 px-2">
          <div className="border-t border-border-subtle pt-4 pb-4 border-b">
            <div className="flex items-center justify-start gap-8">
              {recipe.prep_time && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-content-tertiary" />
                  <span className="text-content-secondary">Prep: {recipe.prep_time} min</span>
                </div>
              )}
              {recipe.cook_time && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-content-tertiary" />
                  <span className="text-content-secondary">Cook: {recipe.cook_time} min</span>
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


      {/* Chef's Insight Module */}
      <ChefsInsightCard recipe={recipe} recipeId={recipe.id} />

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
