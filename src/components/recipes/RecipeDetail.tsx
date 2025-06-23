
import { useState } from "react";
import { Recipe } from "@/types";
import { RecipeHeroSection } from "./RecipeHeroSection";
import { RecipeActionButtons } from "./RecipeActionButtons";
import { RecipeMetaInfo } from "./RecipeMetaInfo";
import { RecipeTabContent } from "./RecipeTabContent";
import { RecipeFooter } from "./RecipeFooter";
import { RecipeImageEditor } from "./RecipeImageEditor";
import { RecipeScalingService } from "@/utils/recipeScaling";

interface RecipeDetailProps {
  recipe: Recipe;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: () => Promise<void>;
  isOwner?: boolean;
  onAddToMealPlan?: (adjustedServings?: number) => void;
  onImageUpdate?: (imageUrl: string) => void;
}

export const RecipeDetail = ({ 
  recipe, 
  onEdit, 
  onDelete, 
  isOwner, 
  onAddToMealPlan,
  onImageUpdate
}: RecipeDetailProps) => {
  const [currentServings, setCurrentServings] = useState(recipe.servings);
  const [scaledIngredients, setScaledIngredients] = useState<string[]>(recipe.ingredients);
  const [showImageEditor, setShowImageEditor] = useState(false);

  const handleServingsChange = (newServings: number) => {
    setCurrentServings(newServings);
    const scaled = RecipeScalingService.scaleIngredients(
      recipe.ingredients, 
      recipe.servings, 
      newServings
    );
    setScaledIngredients(scaled);
  };

  const handleAddToMealPlan = () => {
    onAddToMealPlan?.(currentServings);
  };

  const handleImageUpdate = (imageUrl: string) => {
    onImageUpdate?.(imageUrl);
    setShowImageEditor(false);
  };

  const isScaled = currentServings !== recipe.servings;

  return (
    <div className="max-w-4xl mx-auto">
      <RecipeHeroSection recipe={recipe} />
      
      <RecipeActionButtons
        recipe={recipe}
        onEdit={onEdit}
        onDelete={onDelete}
        isOwner={isOwner}
        onAddToMealPlan={handleAddToMealPlan}
      />

      <RecipeMetaInfo 
        recipe={recipe} 
        onServingsChange={handleServingsChange}
        currentServings={currentServings}
      />

      {/* Description */}
      {recipe.description && (
        <p className="text-gray-600 text-lg mb-6 px-2">{recipe.description}</p>
      )}

      <RecipeTabContent 
        recipe={recipe} 
        scaledIngredients={scaledIngredients}
        isScaled={isScaled}
      />

      <RecipeFooter recipe={recipe} />

      {/* Image Editor Dialog */}
      {showImageEditor && isOwner && (
        <RecipeImageEditor
          recipe={recipe}
          isOpen={showImageEditor}
          onClose={() => setShowImageEditor(false)}
          onImageUpdate={handleImageUpdate}
        />
      )}
    </div>
  );
};
