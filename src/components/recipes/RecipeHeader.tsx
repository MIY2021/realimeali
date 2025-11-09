import { useState } from "react";
import { Recipe } from "@/types";
import { RecipeImage } from "@/components/ui/recipe-image";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { Button } from "@/components/ui/button";
import { Heart, Pencil, Trash2, Plus, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RecipeHeaderProps {
  recipe: Recipe;
  isOwner?: boolean;
  isFavorite: boolean;
  isCooked: boolean;
  onToggleFavorite: () => void;
  onToggleCooked: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onInfoClick?: () => void;
  onAddToMealPlan?: () => void;
}

export const RecipeHeader = ({
  recipe,
  isOwner,
  isFavorite,
  isCooked,
  onToggleFavorite,
  onToggleCooked,
  onEdit,
  onDelete,
  onInfoClick,
  onAddToMealPlan
}: RecipeHeaderProps) => {
  const [isImageLightboxOpen, setIsImageLightboxOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const hasRecipeImage = recipe?.image;

  return (
    <>
    <div className="relative -mx-4 sm:-mx-6 -mt-6">
      {/* Hero Image */}
      <div className="relative h-72 sm:h-96 w-full">
        <RecipeImage
          recipe={recipe}
          className="w-full h-full object-cover"
          iconSize="h-16 w-16"
          onClick={hasRecipeImage ? () => setIsImageLightboxOpen(true) : undefined}
          clickable={!!hasRecipeImage}
        />
        
        {/* Overlay gradient for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />

        {/* Action menu - top right */}
        <div className="absolute top-4 right-4 flex gap-2 items-center">
          {/* Action buttons - slide in from right */}
          <div className={`flex gap-2 transition-all duration-300 ${
            isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
          }`}>
            {isOwner && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onEdit}
                  className="h-12 w-12 rounded-full bg-surface/80 hover:bg-surface shadow-md backdrop-blur-sm"
                >
                  <Pencil className="h-5 w-5 text-content-primary" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className="h-12 w-12 rounded-full bg-surface/80 hover:bg-surface shadow-md backdrop-blur-sm"
                >
                  <Trash2 className="h-5 w-5 text-red-600" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFavorite}
              className="h-12 w-12 rounded-full bg-surface/80 hover:bg-surface shadow-md backdrop-blur-sm"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-content-primary'}`} />
            </Button>
            {onAddToMealPlan && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onAddToMealPlan}
                className="h-12 w-12 rounded-full bg-surface/80 hover:bg-surface shadow-md backdrop-blur-sm"
                title="Add to Meal Plan"
              >
                <Plus className="h-6 w-6 text-green-600" />
              </Button>
            )}
          </div>

          {/* Menu toggle button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="h-12 w-12 rounded-full bg-surface/80 hover:bg-surface shadow-md backdrop-blur-sm"
          >
            <MoreHorizontal className="h-6 w-6 text-content-primary" strokeWidth={3} />
          </Button>
        </div>
      </div>
      
      {/* Title section - just below image */}
      <div className="bg-background px-6 sm:px-8 pt-6 pb-2 rounded-t-3xl -mt-6 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-content-primary flex-1">
            {recipe.title}
          </h1>
          <Badge 
            className={`text-white text-sm px-3 py-1 flex-shrink-0 cursor-pointer ${
              isCooked ? 'bg-sage hover:bg-sage/90' : 'bg-gray-400 hover:bg-gray-500'
            }`}
            onClick={onToggleCooked}
          >
            {isCooked ? 'Cooked' : 'Not Cooked'}
          </Badge>
        </div>
      </div>
      </div>

      {/* Image Lightbox */}
      {hasRecipeImage && (
        <ImageLightbox
          isOpen={isImageLightboxOpen}
          onClose={() => setIsImageLightboxOpen(false)}
          imageUrl={recipe.image!}
          alt={recipe.title}
        />
      )}
    </>
  );
};