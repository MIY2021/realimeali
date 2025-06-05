
import { Recipe } from "@/types";
import { RecipeHeroSection } from "./RecipeHeroSection";
import { RecipeActionButtons } from "./RecipeActionButtons";
import { RecipeMetaInfo } from "./RecipeMetaInfo";
import { RecipeTabContent } from "./RecipeTabContent";
import { RecipeFooter } from "./RecipeFooter";

interface RecipeDetailProps {
  recipe: Recipe;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: () => Promise<void>;
  isOwner?: boolean;
  onAddToMealPlan?: () => void;
}

export const RecipeDetail = ({ 
  recipe, 
  onEdit, 
  onDelete, 
  isOwner, 
  onAddToMealPlan 
}: RecipeDetailProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <RecipeHeroSection recipe={recipe} />
      
      <RecipeActionButtons
        recipe={recipe}
        onEdit={onEdit}
        onDelete={onDelete}
        isOwner={isOwner}
        onAddToMealPlan={onAddToMealPlan}
      />

      <RecipeMetaInfo recipe={recipe} />

      {/* Description */}
      {recipe.description && (
        <p className="text-gray-600 text-lg mb-6 px-2">{recipe.description}</p>
      )}

      <RecipeTabContent recipe={recipe} />

      <RecipeFooter recipe={recipe} />
    </div>
  );
};
