
import { Clock, Users } from "lucide-react";
import { Recipe } from "@/types";

interface RecipeMetaInfoProps {
  recipe: Recipe;
}

export const RecipeMetaInfo = ({ recipe }: RecipeMetaInfoProps) => {
  const totalTime = recipe.prep_time + recipe.cook_time;

  return (
    <div className="flex items-center gap-8 mb-6 px-2">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-terracotta" />
        <span className="text-navy font-medium">{totalTime} min total</span>
      </div>
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-terracotta" />
        <span className="text-navy font-medium">{recipe.servings} servings</span>
      </div>
    </div>
  );
};
