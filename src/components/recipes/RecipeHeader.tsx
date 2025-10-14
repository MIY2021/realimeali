import { Recipe } from "@/types";
import { RecipeImage } from "@/components/ui/recipe-image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
}

export const RecipeHeader = ({
  recipe,
  isOwner,
  isFavorite,
  isCooked,
  onToggleFavorite,
  onToggleCooked,
  onEdit,
  onDelete
}: RecipeHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="relative mb-6 -mx-4 sm:-mx-6">
      {/* Hero Image */}
      <div className="relative h-72 sm:h-96 w-full">
        <RecipeImage
          recipe={recipe}
          className="w-full h-full object-cover"
          iconSize="h-16 w-16"
        />
        
        {/* Overlay gradient for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        
        {/* Back button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 h-12 w-12 rounded-full bg-white/90 hover:bg-white shadow-md"
        >
          <ArrowLeft className="h-5 w-5 text-gray-800" />
        </Button>
        
        {/* Action icons */}
        <div className="absolute top-4 right-4 flex gap-2">
          {isOwner && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="h-12 w-12 rounded-full bg-white/90 hover:bg-white shadow-md"
              >
                <Pencil className="h-5 w-5 text-gray-800" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-12 w-12 rounded-full bg-white/90 hover:bg-white shadow-md"
              >
                <Trash2 className="h-5 w-5 text-red-600" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFavorite}
            className="h-12 w-12 rounded-full bg-white/90 hover:bg-white shadow-md"
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-800'}`} />
          </Button>
        </div>
      </div>
      
      {/* Title section - just below image */}
      <div className="bg-background px-4 sm:px-6 pt-6 pb-2">
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