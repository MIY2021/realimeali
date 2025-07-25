
import { useState, useEffect } from "react";
import { Recipe } from "@/types";
import { RecipeHeroSection } from "./RecipeHeroSection";
import { RecipeActionButtons } from "./RecipeActionButtons";
import { RecipeMetaInfo } from "./RecipeMetaInfo";
import { RecipeTabContent } from "./RecipeTabContent";
import { RecipeFooter } from "./RecipeFooter";
import { RecipeImageEditor } from "./RecipeImageEditor";
import { RecipeNotesSection } from "./RecipeNotesSection";
import { RecipeClassificationSummary } from "./RecipeClassificationSummary";
import { NutritionalInfoSection } from "@/components/nutrition/NutritionalInfoSection";
import { Lightbulb, Users, RotateCcw, Clock } from "lucide-react";
import { ServingsSelector } from "@/components/meal-planner/ServingsSelector";
import { Button } from "@/components/ui/button";
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

  // Load saved servings from localStorage on mount
  useEffect(() => {
    const savedServings = localStorage.getItem(`recipe-servings-${recipe.id}`);
    if (savedServings) {
      const servings = parseInt(savedServings, 10);
      if (servings > 0) {
        setCurrentServings(servings);
        const scaled = RecipeScalingService.scaleIngredients(
          recipe.ingredients, 
          recipe.servings, 
          servings
        );
        setScaledIngredients(scaled);
      }
    }
  }, [recipe.id, recipe.ingredients, recipe.servings]);

  const handleServingsChange = (newServings: number) => {
    setCurrentServings(newServings);
    localStorage.setItem(`recipe-servings-${recipe.id}`, newServings.toString());
    const scaled = RecipeScalingService.scaleIngredients(
      recipe.ingredients, 
      recipe.servings, 
      newServings
    );
    setScaledIngredients(scaled);
  };

  const handleServingsReset = () => {
    setCurrentServings(recipe.servings);
    localStorage.removeItem(`recipe-servings-${recipe.id}`);
    setScaledIngredients(recipe.ingredients);
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

      {/* Cooking Time */}
      <div className="mb-6 px-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-terracotta" />
            <span className="text-navy font-medium text-sm">Prep: {recipe.prep_time} min</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-terracotta" />
            <span className="text-navy font-medium text-sm">Cook: {recipe.cook_time} min</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {recipe.description && (
        <p className="text-gray-600 text-lg mb-6 px-2">{recipe.description}</p>
      )}

      {/* Recipe Classification */}
      <RecipeClassificationSummary recipe={recipe} />

      {/* Top Tip */}
      {recipe.top_tip && recipe.top_tip !== "Enjoy cooking this delicious recipe!" && (
        <div className="mb-6">
          <div className="bg-sage/10 border border-sage/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <Lightbulb className="h-5 w-5 text-sage" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sage-800 mb-2">Top Tip</h3>
                <p className="text-gray-700 leading-relaxed sm:ml-0 -ml-8">
                  {recipe.top_tip}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nutritional Information */}
      <div className="mb-6">
        <NutritionalInfoSection recipe={recipe} />
      </div>

      {/* Recipe Notes */}
      <div className="mb-6">
        <RecipeNotesSection recipeId={recipe.id} />
      </div>

      {/* Servings Controller */}
      <div className="mb-4 px-2">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-terracotta" />
          <span className="text-navy font-medium">Servings:</span>
          <ServingsSelector
            currentServings={currentServings}
            onServingsChange={handleServingsChange}
            minServings={1}
            maxServings={20}
          />
          {isScaled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleServingsReset}
              className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 flex-shrink-0"
              title="Reset to original servings"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          )}
        </div>
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
