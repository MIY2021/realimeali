import { useState } from "react";
import { Recipe } from "@/types";
import { RecipeImage } from "@/components/ui/recipe-image";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { Button } from "@/components/ui/button";
import { Heart, Pencil, Trash2, Plus, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

        {/* Three-dot menu - top right */}
        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-white/80 hover:bg-white shadow-md backdrop-blur-sm"
              >
                <MoreVertical className="h-5 w-5 text-gray-800" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              align="end" 
              side="left"
              className="w-56 animate-slide-in-left"
            >
              {/* Favorite option - always visible */}
              <DropdownMenuItem onClick={onToggleFavorite}>
                <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </DropdownMenuItem>
              
              {/* Add to Meal Plan - if callback provided */}
              {onAddToMealPlan && (
                <DropdownMenuItem onClick={onAddToMealPlan}>
                  <Plus className="h-4 w-4 mr-2 text-green-600" />
                  Add to Meal Plan
                </DropdownMenuItem>
              )}
              
              {/* Owner actions */}
              {isOwner && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Recipe
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={onDelete}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Recipe
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Title section - just below image */}
      <div className="bg-background px-6 sm:px-8 pt-6 pb-2 rounded-t-3xl -mt-6 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex-1">
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