
import { useState } from "react";
import { Recipe } from "@/types";
import { RecipeHeroSection } from "./RecipeHeroSection";
import { RecipeActionButtons } from "./RecipeActionButtons";
import { RecipeMetaInfo } from "./RecipeMetaInfo";
import { RecipeTabContent } from "./RecipeTabContent";
import { RecipeFooter } from "./RecipeFooter";
import { RecipeImageEditor } from "./RecipeImageEditor";
import { RecipeNotesSection } from "./RecipeNotesSection";
import { RecipeClassificationSummary } from "./RecipeClassificationSummary";
import { Lightbulb } from "lucide-react";
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

      {/* Recipe Classification */}
      <RecipeClassificationSummary recipe={recipe} />

      {/* Top Tip */}
      {recipe.top_tip && recipe.top_tip !== "Enjoy cooking this delicious recipe!" && (
        <div className="mb-6 px-2">
          <div className="bg-sage/10 border border-sage/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <Lightbulb className="h-5 w-5 text-sage" />
              </div>
              <div>
                <h3 className="font-semibold text-sage-800 mb-2">Chef's Tip</h3>
                <p className="text-gray-700 leading-relaxed">{recipe.top_tip}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Notes */}
      <div className="mb-6 px-2">
        <RecipeNotesSection recipeId={recipe.id} />
      </div>

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
