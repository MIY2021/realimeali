
import { Recipe } from "@/types";
import { RecipeImage } from "@/components/ui/recipe-image";

interface RecipeHeroSectionProps {
  recipe: Recipe;
}

export const RecipeHeroSection = ({ recipe }: RecipeHeroSectionProps) => {
  return (
    <div className="relative mb-6">
      {/* Recipe Image */}
      <div className="relative h-64 sm:h-80 w-full rounded-lg overflow-hidden mb-4">
        <RecipeImage
          recipe={recipe}
          className="w-full h-full"
          iconSize="h-16 w-16"
        />
      </div>

      {/* Recipe Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 px-2">
        {recipe.title}
      </h1>
    </div>
  );
};
