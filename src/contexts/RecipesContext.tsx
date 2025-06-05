
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Recipe } from '@/types';
import { useRecipeApi } from '@/hooks/useRecipeApi';
import { toast } from 'sonner';
import { useHousehold } from '@/contexts/HouseholdContext';

interface RecipesContextType {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  fetchRecipes: (householdId: string | null) => Promise<void>;
  getRecipeById: (id: string) => Recipe | undefined;
  getRecipeBySlug: (slug: string) => Recipe | undefined;
  createRecipe: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>, householdId: string) => Promise<Recipe | null>;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => Promise<Recipe | null>;
  deleteRecipe: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string, isFavorite: boolean) => Promise<Recipe | null>;
  toggleCookingStatus: (id: string) => Promise<Recipe | null>;
}

const RecipesContext = createContext<RecipesContextType | undefined>(undefined);

export const RecipesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentHousehold, isLoadingHousehold } = useHousehold();
  const api = useRecipeApi();

  // Auto-fetch recipes when household is available
  useEffect(() => {
    // Don't fetch if household is still loading
    if (isLoadingHousehold) {
      return;
    }

    // Auto-fetch recipes when a household is available
    if (currentHousehold?.id) {
      console.log('RecipesContext: Auto-fetching recipes for household:', currentHousehold.id);
      fetchRecipes(currentHousehold.id);
    } else {
      console.log('RecipesContext: No household available, clearing recipes');
      setRecipes([]);
    }
  }, [currentHousehold?.id, isLoadingHousehold]);

  const fetchRecipes = useCallback(async (householdId: string | null) => {
    if (!householdId) {
      console.log('RecipesContext: No household ID provided, skipping fetch');
      return;
    }
    
    console.log('RecipesContext: Fetching recipes for household:', householdId);
    setIsLoading(true);
    setError(null);
    try {
      const fetchedRecipes = await api.fetchRecipes(householdId);
      console.log('RecipesContext: Fetched recipes:', fetchedRecipes.length);
      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error('RecipesContext: Error fetching recipes:', error);
      setError('Failed to load recipes');
      toast.error("Failed to load recipes");
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  const getRecipeById = useCallback((id: string) => {
    return recipes.find(recipe => recipe.id === id);
  }, [recipes]);

  const getRecipeBySlug = useCallback((slug: string) => {
    return recipes.find(recipe => recipe.title.toLowerCase().replace(/\s+/g, '-') === slug);
  }, [recipes]);

  const createRecipe = useCallback(async (
    recipeData: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>,
    householdId: string
  ): Promise<Recipe | null> => {
    try {
      const newRecipe = await api.createRecipe(recipeData, householdId);
      if (newRecipe) {
        setRecipes(prev => [newRecipe, ...prev]);
      }
      return newRecipe;
    } catch (error) {
      console.error('Error creating recipe:', error);
      toast.error("Failed to create recipe");
      return null;
    }
  }, [api]);

  const updateRecipe = useCallback(async (id: string, recipeData: Partial<Recipe>): Promise<Recipe | null> => {
    const existingRecipe = getRecipeById(id);
    if (!existingRecipe) return null;

    try {
      const updatedRecipe = await api.updateRecipe(id, { ...existingRecipe, ...recipeData });
      if (updatedRecipe) {
        setRecipes(prev => prev.map(recipe => 
          recipe.id === id ? updatedRecipe : recipe
        ));
      }
      return updatedRecipe;
    } catch (error) {
      console.error('Error updating recipe:', error);
      toast.error("Failed to update recipe");
      return null;
    }
  }, [api, getRecipeById]);

  const deleteRecipe = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await api.deleteRecipe(id);
      if (success) {
        setRecipes(prev => prev.filter(recipe => recipe.id !== id));
        toast.success("Recipe deleted successfully");
      }
      return success;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast.error("Failed to delete recipe");
      return false;
    }
  }, [api]);

  const toggleFavorite = useCallback(async (id: string, isFavorite: boolean): Promise<Recipe | null> => {
    const existingRecipe = getRecipeById(id);
    if (!existingRecipe) return null;

    try {
      const updatedRecipe = await updateRecipe(id, { is_favorite: isFavorite });
      return updatedRecipe;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error("Failed to update favorite status");
      return null;
    }
  }, [updateRecipe, getRecipeById]);

  const toggleCookingStatus = useCallback(async (id: string): Promise<Recipe | null> => {
    const existingRecipe = getRecipeById(id);
    if (!existingRecipe) return null;

    try {
      const newCookingStatus = await api.toggleCookingStatus(id);
      const updatedRecipe = { ...existingRecipe, has_cooked: newCookingStatus };
      
      setRecipes(prev => prev.map(recipe => 
        recipe.id === id ? updatedRecipe : recipe
      ));

      toast.success(`Recipe marked as ${newCookingStatus ? 'cooked' : 'not cooked'}`);

      return updatedRecipe;
    } catch (error) {
      console.error('Error toggling cooking status:', error);
      toast.error("Failed to update cooking status");
      return null;
    }
  }, [api, getRecipeById]);

  const value: RecipesContextType = {
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
    toggleCookingStatus,
  };

  return (
    <RecipesContext.Provider value={value}>
      {children}
    </RecipesContext.Provider>
  );
};

export const useRecipes = () => {
  const context = useContext(RecipesContext);
  if (context === undefined) {
    throw new Error('useRecipes must be used within a RecipesProvider');
  }
  return context;
};
