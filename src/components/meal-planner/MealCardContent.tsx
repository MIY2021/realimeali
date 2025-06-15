
import { useIsMobile } from "@/hooks/use-mobile";
import { Recipe } from "@/types";
import { generateSlug } from "@/utils/slugUtils";
import { useNavigate } from "react-router-dom";

interface MealCardContentProps {
  recipeImage: string;
  recipeTitle: string;
  isCompleted: boolean;
  parentRecipe?: Recipe | undefined;
  recipe?: Recipe | undefined;
}

export const MealCardContent = ({
  recipeImage,
  recipeTitle,
  isCompleted,
  parentRecipe,
  recipe,
}: MealCardContentProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleTitleClick = () => {
    const recipeToUse = parentRecipe || recipe;
    if (recipeToUse) {
      const slug = generateSlug(recipeToUse.title);
      navigate(`/my-recipes/${slug}`);
    }
  };

  return (
    <div className="flex items-start gap-3">
      <img
        src={recipeImage}
        alt={recipeTitle}
        className="h-16 w-16 rounded-lg object-cover object-center aspect-square flex-shrink-0"
      />
      <div className="flex flex-col min-w-0 flex-1">
        <h4 
          className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'} line-clamp-1 text-navy cursor-pointer hover:text-terracotta transition-colors mb-1 ${
            isCompleted ? 'line-through' : ''
          }`}
          onClick={handleTitleClick}
        >
          {recipeTitle}
        </h4>
      </div>
    </div>
  );
};
