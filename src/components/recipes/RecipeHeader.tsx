import { Recipe } from "@/types";
import { RecipeImage } from "@/components/ui/recipe-image";
import { Button } from "@/components/ui/button";
import { Heart, Pencil, Trash2, Info } from "lucide-react";
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
  onInfoClick
}: RecipeHeaderProps) => {
  return (
    <div className="relative -mx-4 sm:-mx-6 -mt-6">
      {/* Hero Image */}
      <div className="relative h-72 sm:h-96 w-full">
        <RecipeImage
          recipe={recipe}
          className="w-full h-full object-cover"
          iconSize="h-16 w-16"
        />
        
        {/* Overlay gradient for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        
        {/* Action icons - top right */}
        <div className="absolute top-4 right-4 flex gap-2">
          {isOwner && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="h-12 w-12 rounded-full bg-white/50 hover:bg-white/70 shadow-md backdrop-blur-sm"
              >
                <Pencil className="h-5 w-5 text-gray-800" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-12 w-12 rounded-full bg-white/50 hover:bg-white/70 shadow-md backdrop-blur-sm"
              >
                <Trash2 className="h-5 w-5 text-red-600" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFavorite}
            className="h-12 w-12 rounded-full bg-white/50 hover:bg-white/70 shadow-md backdrop-blur-sm"
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-800'}`} />
          </Button>
        </div>

        {/* Info icon - bottom right */}
        {onInfoClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onInfoClick}
            className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-white/50 hover:bg-white/70 shadow-md backdrop-blur-sm"
          >
            <Info className="h-4 w-4 text-gray-800" />
          </Button>
        )}
      </div>
      
      {/* Title section - just below image */}
      <div className="bg-background px-4 sm:px-6 pt-6 pb-2 rounded-t-3xl -mt-6 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex-1">
            {recipe.title}
          </h1>
          {isCooked && (
            <Badge 
              className="bg-sage text-white text-sm px-3 py-1 flex-shrink-0 cursor-pointer hover:bg-sage/90"
              onClick={onToggleCooked}
            >
              Cooked
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};