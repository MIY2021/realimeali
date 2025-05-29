
import { Recipe } from "@/types";

export interface RecipesContextType {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  fetchRecipes: (householdId: string | null) => Promise<void>;
  getRecipeById: (id: string) => Recipe | undefined;
  getRecipeBySlug: (slug: string) => Recipe | undefined;
  createRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>, householdId: string) => Promise<Recipe | null>;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => Promise<Recipe | null>;
  deleteRecipe: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string, isFavorite: boolean) => Promise<Recipe | null>;
}
