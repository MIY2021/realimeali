
import { Recipe } from "@/types";

export const transformDbRecipeToRecipe = (dbRecipe: any): Recipe => ({
  id: dbRecipe.id,
  title: dbRecipe.title,
  description: dbRecipe.description || '',
  ingredients: dbRecipe.ingredients || [],
  instructions: dbRecipe.instructions || [],
  categories: dbRecipe.categories || [],
  prepTime: dbRecipe.prep_time || 0,
  cookTime: dbRecipe.cook_time || 0,
  servings: dbRecipe.servings || 1,
  image: dbRecipe.image || undefined,
  topTip: dbRecipe.top_tip || undefined,
  isFavorite: dbRecipe.is_favorite || false,
  createdBy: dbRecipe.user_id,
  createdAt: dbRecipe.created_at,
  updatedAt: dbRecipe.updated_at,
  householdId: dbRecipe.household_id
});

export const transformRecipeToDbInsert = (
  recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
  userId: string,
  householdId: string
) => ({
  title: recipeData.title,
  description: recipeData.description,
  ingredients: recipeData.ingredients,
  instructions: recipeData.instructions,
  categories: recipeData.categories,
  prep_time: recipeData.prepTime,
  cook_time: recipeData.cookTime,
  servings: recipeData.servings,
  image: recipeData.image,
  top_tip: recipeData.topTip,
  is_favorite: recipeData.isFavorite,
  user_id: userId,
  household_id: householdId
});

export const transformRecipeToDbUpdate = (recipeData: Partial<Recipe>) => {
  const updateData: any = {};
  if (recipeData.title !== undefined) updateData.title = recipeData.title;
  if (recipeData.description !== undefined) updateData.description = recipeData.description;
  if (recipeData.ingredients !== undefined) updateData.ingredients = recipeData.ingredients;
  if (recipeData.instructions !== undefined) updateData.instructions = recipeData.instructions;
  if (recipeData.categories !== undefined) updateData.categories = recipeData.categories;
  if (recipeData.prepTime !== undefined) updateData.prep_time = recipeData.prepTime;
  if (recipeData.cookTime !== undefined) updateData.cook_time = recipeData.cookTime;
  if (recipeData.servings !== undefined) updateData.servings = recipeData.servings;
  if (recipeData.image !== undefined) updateData.image = recipeData.image;
  if (recipeData.topTip !== undefined) updateData.top_tip = recipeData.topTip;
  if (recipeData.isFavorite !== undefined) updateData.is_favorite = recipeData.isFavorite;
  return updateData;
};
