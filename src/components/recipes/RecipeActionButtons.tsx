
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Heart, Pencil, Trash2, Plus } from "lucide-react";
import { Recipe } from "@/types";
import { useRecipes } from "@/contexts/RecipesContext";

interface RecipeActionButtonsProps {
  recipe: Recipe;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: () => Promise<void>;
  isOwner?: boolean;
  onAddToMealPlan?: () => void;
}

export const RecipeActionButtons = ({ 
  recipe, 
  onEdit, 
  onDelete, 
  isOwner, 
  onAddToMealPlan 
}: RecipeActionButtonsProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingCooked, setIsTogglingCooked] = useState(false);
  const { toggleFavorite, toggleCookingStatus } = useRecipes();

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleFavorite = async () => {
    await toggleFavorite(recipe.id, !recipe.is_favorite);
  };

  const handleToggleCooked = async () => {
    setIsTogglingCooked(true);
    try {
      await toggleCookingStatus(recipe.id);
    } finally {
      setIsTogglingCooked(false);
    }
  };

  return (
    <div className="mb-4 px-2">
      {/* Mobile: Stack buttons vertically */}
      <div className="block sm:hidden space-y-3">
        {/* Top row - Add to Meal Plan button (full width) */}
        <Button 
          onClick={onAddToMealPlan}
          className="bg-terracotta hover:bg-terracotta/90 text-white w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add to Meal Plan
        </Button>
        
        {/* Bottom row - all buttons in a row */}
        <div className="flex gap-2">
          {/* Cooking Status Toggle */}
          <Button
            variant="outline"
            onClick={handleToggleCooked}
            disabled={isTogglingCooked}
            className={`transition-all duration-200 flex-1 ${
              recipe.has_cooked
                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                : 'hover:bg-gray-50'
            }`}
          >
            <User className="h-4 w-4 mr-1" />
            {recipe.has_cooked ? 'Cooked' : 'Mark as Cooked'}
          </Button>

          {/* Favorite button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleToggleFavorite}
            className="hover:bg-gray-50 flex-shrink-0"
          >
            <Heart className={`h-5 w-5 ${recipe.is_favorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </Button>

          {/* Owner actions - Edit and Delete buttons */}
          {isOwner && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit?.(recipe)}
                className="hover:bg-gray-50 flex-shrink-0"
              >
                <Pencil className="h-4 w-4 text-gray-600" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleDelete}
                disabled={isDeleting}
                className="hover:bg-red-50 text-red-600 border-red-200 flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Desktop: Horizontal layout */}
      <div className="hidden sm:flex items-center justify-between">
        <div className="flex gap-3">
          {/* Add to Meal Plan button */}
          <Button 
            onClick={onAddToMealPlan}
            className="bg-terracotta hover:bg-terracotta/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add to Meal Plan
          </Button>

          {/* Cooking Status Toggle */}
          <Button
            variant="outline"
            onClick={handleToggleCooked}
            disabled={isTogglingCooked}
            className={`transition-all duration-200 ${
              recipe.has_cooked
                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                : 'hover:bg-gray-50'
            }`}
          >
            <User className="h-4 w-4 mr-2" />
            {recipe.has_cooked ? 'Cooked' : 'Mark as Cooked'}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Favorite button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleToggleFavorite}
            className="hover:bg-gray-50"
          >
            <Heart className={`h-5 w-5 ${recipe.is_favorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </Button>

          {/* Owner actions - Edit and Delete buttons */}
          {isOwner && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit?.(recipe)}
                className="hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4 text-gray-600" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleDelete}
                disabled={isDeleting}
                className="hover:bg-red-50 text-red-600 border-red-200"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
