
import { Recipe } from "@/types";

// Simplified transformers - no camelCase conversion needed
export const transformDbRecipeToRecipe = (dbRecipe: any): Recipe => dbRecipe;

export const transformRecipeToDbInsert = (
  recipeData: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>,
  userId: string,
  householdId: string
) => ({
  ...recipeData,
  user_id: userId,
  household_id: householdId
});

export const transformRecipeToDbUpdate = (recipeData: Partial<Recipe>) => {
  // Remove id, created_at, updated_at, created_by from updates
  const { id, created_at, updated_at, created_by, ...updateData } = recipeData;
  return updateData;
};
