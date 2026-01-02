import { useState } from "react";
import { Recipe } from "@/types";
import { RecipeImage } from "@/components/ui/recipe-image";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, Pencil, Trash2, Plus, MoreHorizontal, Check } from "lucide-react";


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

        {/* Action menu - top right */}
        <div className="absolute top-4 right-4 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-white/80 hover:bg-white shadow-md backdrop-blur-sm"
                onMouseDown={(e) => e.preventDefault()}
              >
                <MoreHorizontal className="h-6 w-6 text-gray-800" strokeWidth={3} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-xl rounded-xl p-1.5 min-w-[200px]"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              {/* Order: Add to Plan / Favourite / Cooked / Edit / Delete */}
              {onAddToMealPlan && (
                <DropdownMenuItem
                  onClick={onAddToMealPlan}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg hover:bg-green-50 transition-colors duration-200 focus:bg-green-50 focus:text-green-600"
                >
                  <Plus className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Add to Meal Plan</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={onToggleFavorite}
                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg transition-colors duration-200 ${
                  isFavorite 
                    ? 'hover:bg-red-50 focus:bg-red-50' 
                    : 'hover:bg-gray-50 focus:bg-gray-50'
                }`}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                <span className={`text-sm font-medium ${isFavorite ? 'text-red-500' : 'text-gray-700'}`}>
                  {isFavorite ? 'Remove from favourites' : 'Add to favourites'}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  onToggleCooked();
                }}
                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg transition-colors duration-200 ${
                  isCooked 
                    ? 'bg-sage/10 hover:bg-sage/20 focus:bg-sage/20' 
                    : 'hover:bg-gray-50 focus:bg-gray-50'
                }`}
              >
                <Check className={`h-4 w-4 ${isCooked ? 'text-sage' : 'text-gray-600'}`} />
                <span className={`text-sm font-medium ${isCooked ? 'text-sage' : 'text-gray-700'}`}>
                  {isCooked ? 'Meal Cooked' : 'Mark as cooked'}
                </span>
              </DropdownMenuItem>
              {isOwner && onEdit && (
                <DropdownMenuItem
                  onClick={onEdit}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:bg-gray-50"
                >
                  <Pencil className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Edit</span>
                </DropdownMenuItem>
              )}
              {isOwner && onDelete && (
                <DropdownMenuItem
                  onClick={onDelete}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg hover:bg-red-50 transition-colors duration-200 focus:bg-red-50 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-gray-700">Delete</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Title section - just below image */}
      <div className="bg-background px-6 sm:px-8 pt-6 pb-2 rounded-t-3xl -mt-6 relative z-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          {recipe.title}
        </h1>
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