
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Recipe } from "@/types";
import { useRecipeApi } from "@/hooks/useRecipeApi";
import { RecipesContextType } from "@/types/recipe";

const RecipesContext = createContext<RecipesContextType | undefined>(undefined);

export const RecipesProvider = ({ children }: { children: ReactNode }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recipeApi = useRecipeApi();

  const fetchRecipes = useCallback(async (householdId: string | null) => {
    if (!householdId) {
      setRecipes([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const fetchedRecipes = await recipeApi.fetchRecipes(householdId);
      setRecipes(fetchedRecipes);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError("Failed to fetch recipes");
    } finally {
      setIsLoading(false);
    }
  }, [recipeApi]);

  const getRecipeById = useCallback((id: string): Recipe | undefined => {
    return recipes.find(recipe => recipe.id === id);
  }, [recipes]);

  const getRecipeBySlug = useCallback((slug: string): Recipe | undefined => {
    return recipes.find(recipe => recipe.slug === slug);
  }, [recipes]);

  const createRecipe = useCallback(async (
    recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>, 
    householdId: string
  ): Promise<Recipe | null> => {
    try {
      const newRecipe = await recipeApi.createRecipe(recipe, householdId);
      if (newRecipe) {
        setRecipes(prev => [newRecipe, ...prev]);
      }
      return newRecipe;
    } catch (err) {
      console.error("Error creating recipe:", err);
      throw err;
    }
  }, [recipeApi]);

  const updateRecipe = useCallback(async (id: string, recipeUpdates: Partial<Recipe>): Promise<Recipe | null> => {
    try {
      const existingRecipe = recipes.find(r => r.id === id);
      if (!existingRecipe) {
        throw new Error('Recipe not found');
      }

      const updatedRecipeData = { ...existingRecipe, ...recipeUpdates };
      const updatedRecipe = await recipeApi.updateRecipe(id, updatedRecipeData);
      
      if (updatedRecipe) {
        setRecipes(prev => prev.map(recipe => 
          recipe.id === id ? updatedRecipe : recipe
        ));
      }
      return updatedRecipe;
    } catch (err) {
      console.error("Error updating recipe:", err);
      throw err;
    }
  }, [recipeApi, recipes]);

  const deleteRecipe = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await recipeApi.deleteRecipe(id);
      if (success) {
        setRecipes(prev => prev.filter(recipe => recipe.id !== id));
      }
      return success;
    } catch (err) {
      console.error("Error deleting recipe:", err);
      return false;
    }
  }, [recipeApi]);

  const toggleFavorite = useCallback(async (id: string, isFavorite: boolean): Promise<Recipe | null> => {
    try {
      return await updateRecipe(id, { is_favorite: isFavorite });
    } catch (err) {
      console.error("Error toggling favorite:", err);
      return null;
    }
  }, [updateRecipe]);

  return (
    <RecipesContext.Provider value={{
      recipes,
      isLoading,
      error,
      fetchRecipes,
      getRecipeById,
      getRecipeBySlug,
      createRecipe,
      updateRecipe,
      deleteRecipe,
      toggleFavorite,
    }}>
      {children}
    </RecipesContext.Provider>
  );
};

export const useRecipes = () => {
  const context = useContext(RecipesContext);
  if (context === undefined) {
    throw new Error("useRecipes must be used within a RecipesProvider");
  }
  return context;
};
