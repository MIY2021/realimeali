
import { Badge } from "@/components/ui/badge";
import { Recipe } from "@/types";
import { RecipeImage } from "@/components/ui/recipe-image";

interface RecipeHeroSectionProps {
  recipe: Recipe;
}

export const RecipeHeroSection = ({ recipe }: RecipeHeroSectionProps) => {
  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <div className="relative h-80 mb-3 rounded-lg overflow-hidden shadow-lg">
      <RecipeImage 
        recipe={recipe} 
        className="w-full h-full object-cover"
        iconSize="h-12 w-12"
      />
      
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      
      {/* Title and meta info overlay - bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h1 className="text-3xl font-bold text-white mb-3">{recipe.title}</h1>
        
        {/* Recipe badges */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {recipe.meal_type && (
            <Badge className="bg-terracotta/90 text-white border-0 backdrop-blur-sm">
              {capitalizeFirst(recipe.meal_type)}
            </Badge>
          )}
          {recipe.complexity_level && (
            <Badge variant="outline" className="border-white/40 text-white bg-white/10 backdrop-blur-sm">
              {capitalizeFirst(recipe.complexity_level.replace('_', ' '))}
            </Badge>
          )}
          {recipe.cuisine_region && (
            <Badge variant="outline" className="border-white/40 text-white bg-white/10 backdrop-blur-sm">
              {capitalizeFirst(recipe.cuisine_region)}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
