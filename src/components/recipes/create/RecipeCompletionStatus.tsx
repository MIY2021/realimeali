
import { Recipe } from "@/types";

interface RecipeCompletionStatusProps {
  newRecipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
}

export function useRecipeCompletionStatus({ newRecipe }: RecipeCompletionStatusProps) {
  const hasTitle = newRecipe.title.trim().length > 0;
  const hasIngredients = newRecipe.ingredients.length > 0;
  const hasInstructions = newRecipe.instructions.length > 0;
  
  // Check if recipe was actually generated/processed
  const wasGenerated = hasTitle && hasIngredients && hasInstructions && (
    newRecipe.title.length > 5 || // Likely generated content
    hasIngredients && hasInstructions // Has structured data
  );

  return {
    isComplete: hasTitle && hasIngredients && hasInstructions,
    wasGenerated,
    hasTitle,
    hasIngredients,
    hasInstructions,
  };
}
