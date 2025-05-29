
import { Recipe } from "@/types";

export const transformDbRecipeToRecipe = (dbRecipe: any): Recipe => ({
  id: dbRecipe.id,
  title: dbRecipe.title,
  description: dbRecipe.description || '',
  ingredients: dbRecipe.ingredients || [],
  instructions: dbRecipe.instructions || [],
  // Map new classification fields
  mealType: dbRecipe.meal_type,
  cuisine: dbRecipe.cuisine,
  dietLifestyle: dbRecipe.diet_lifestyle || [],
  complexityLevel: dbRecipe.complexity_level,
  prepTime: dbRecipe.prep_time || 0,
  cookTime: dbRecipe.cook_time || 0,
  servings: dbRecipe.servings || 1,
  image: dbRecipe.image || undefined,
  isFavorite: dbRecipe.is_favorite || false,
  createdBy: dbRecipe.user_id,
  createdAt: dbRecipe.created_at,
  updatedAt: dbRecipe.updated_at,
  householdId: dbRecipe.household_id,
  slug: dbRecipe.slug
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
  // Map new classification fields to database columns
  meal_type: recipeData.mealType,
  cuisine: recipeData.cuisine,
  diet_lifestyle: recipeData.dietLifestyle || [],
  complexity_level: recipeData.complexityLevel,
  prep_time: recipeData.prepTime,
  cook_time: recipeData.cookTime,
  servings: recipeData.servings,
  image: recipeData.image,
  is_favorite: recipeData.isFavorite,
  user_id: userId,
  household_id: householdId,
  slug: recipeData.slug
});

export const transformRecipeToDbUpdate = (recipeData: Partial<Recipe>) => {
  const updateData: any = {};
  if (recipeData.title !== undefined) updateData.title = recipeData.title;
  if (recipeData.description !== undefined) updateData.description = recipeData.description;
  if (recipeData.ingredients !== undefined) updateData.ingredients = recipeData.ingredients;
  if (recipeData.instructions !== undefined) updateData.instructions = recipeData.instructions;
  if (recipeData.mealType !== undefined) updateData.meal_type = recipeData.mealType;
  if (recipeData.cuisine !== undefined) updateData.cuisine = recipeData.cuisine;
  if (recipeData.dietLifestyle !== undefined) updateData.diet_lifestyle = recipeData.dietLifestyle;
  if (recipeData.complexityLevel !== undefined) updateData.complexity_level = recipeData.complexityLevel;
  if (recipeData.prepTime !== undefined) updateData.prep_time = recipeData.prepTime;
  if (recipeData.cookTime !== undefined) updateData.cook_time = recipeData.cookTime;
  if (recipeData.servings !== undefined) updateData.servings = recipeData.servings;
  if (recipeData.image !== undefined) updateData.image = recipeData.image;
  if (recipeData.isFavorite !== undefined) updateData.is_favorite = recipeData.isFavorite;
  if (recipeData.slug !== undefined) updateData.slug = recipeData.slug;
  return updateData;
};
