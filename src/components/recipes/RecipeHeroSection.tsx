
import { Recipe } from "@/types";
import { RecipeImage } from "@/components/ui/recipe-image";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface RecipeHeroSectionProps {
  recipe: Recipe;
  onEditImage?: () => void;
}

export const RecipeHeroSection = ({ recipe, onEditImage }: RecipeHeroSectionProps) => {
  return (
    <div className="relative mb-6">
      {/* Recipe Image */}
      <div className="relative h-64 sm:h-80 w-full rounded-lg overflow-hidden mb-4">
        <RecipeImage
          recipe={recipe}
          className="w-full h-full"
          iconSize="h-16 w-16"
        />
        
        {/* Edit Image Button - Only show for owners */}
        {onEditImage && (
          <div className="absolute top-4 right-4">
            <Button
              onClick={onEditImage}
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white backdrop-blur-sm"
            >
              <Camera className="h-4 w-4 mr-2" />
              Edit Image
            </Button>
          </div>
        )}
      </div>

      {/* Recipe Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 px-2">
        {recipe.title}
      </h1>
    </div>
  );
};
