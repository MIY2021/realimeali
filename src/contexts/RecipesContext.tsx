
import { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { Recipe } from '@/types';
import { useRecipeApi } from '@/hooks/useRecipeApi';
import { useAuth } from '@/contexts/AuthContext';
import { useHousehold } from '@/contexts/HouseholdContext';

interface RecipesContextType {
  recipes: Recipe[];
  setRecipes: (recipes: Recipe[]) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, recipe: Recipe) => Promise<void>;
  removeRecipe: (id: string) => void;
  getRecipeById: (id: string) => Recipe | undefined;
  getRecipeBySlug: (slug: string) => Recipe | undefined;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  // Add missing methods
  fetchRecipes: (householdId: string | null) => Promise<void>;
  createRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>, householdId: string) => Promise<Recipe | null>;
  deleteRecipe: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string, isFavorite: boolean) => Promise<void>;
}

const RecipesContext = createContext<RecipesContextType | undefined>(undefined);

export const useRecipes = () => {
  const context = useContext(RecipesContext);
  if (!context) {
    throw new Error('useRecipes must be used within a RecipesProvider');
  }
  return context;
};

interface RecipesProviderProps {
  children: ReactNode;
}

export const RecipesProvider = ({ children }: RecipesProviderProps) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recipeApi = useRecipeApi();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();

  // Auto-fetch recipes when household changes
  useEffect(() => {
    if (user && currentHousehold) {
      console.log("Auto-fetching recipes for household:", currentHousehold.id);
      fetchRecipes(currentHousehold.id);
    } else {
      console.log("Clearing recipes - no user or household");
      setRecipes([]);
    }
  }, [user?.id, currentHousehold?.id]);

  const addRecipe = useCallback((recipe: Recipe) => {
    setRecipes(prev => [recipe, ...prev]);
  }, []);

  const updateRecipe = useCallback(async (id: string, updatedRecipe: Recipe) => {
    try {
      setError(null);
      const result = await recipeApi.updateRecipe(id, updatedRecipe);
      if (result) {
        setRecipes(prev => prev.map(recipe => 
          recipe.id === id ? result : recipe
        ));
      }
    } catch (error) {
      console.error('Error updating recipe:', error);
      setError('Failed to update recipe');
      throw error;
    }
  }, [recipeApi]);

  const removeRecipe = useCallback((id: string) => {
    setRecipes(prev => prev.filter(recipe => recipe.id !== id));
  }, []);

  const getRecipeById = useCallback((id: string) => {
    return recipes.find(recipe => recipe.id === id);
  }, [recipes]);

  const createSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, []);

  const getRecipeBySlug = useCallback((slug: string) => {
    return recipes.find(recipe => createSlug(recipe.title) === slug);
  }, [recipes, createSlug]);

  // Add missing methods using the API
  const fetchRecipes = useCallback(async (householdId: string | null) => {
    if (!householdId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const fetchedRecipes = await recipeApi.fetchRecipes(householdId);
      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setError('Failed to fetch recipes');
    } finally {
      setIsLoading(false);
    }
  }, [recipeApi]);

  const createRecipe = useCallback(async (
    recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>, 
    householdId: string
  ) => {
    try {
      setError(null);
      const newRecipe = await recipeApi.createRecipe(recipeData, householdId);
      if (newRecipe) {
        addRecipe(newRecipe);
      }
      return newRecipe;
    } catch (error) {
      console.error('Error creating recipe:', error);
      setError('Failed to create recipe');
      return null;
    }
  }, [recipeApi, addRecipe]);

  const deleteRecipe = useCallback(async (id: string) => {
    try {
      setError(null);
      const success = await recipeApi.deleteRecipe(id);
      if (success) {
        removeRecipe(id);
      }
      return success;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      setError('Failed to delete recipe');
      return false;
    }
  }, [recipeApi, removeRecipe]);

  const toggleFavorite = useCallback(async (id: string, isFavorite: boolean) => {
    try {
      setError(null);
      const recipe = getRecipeById(id);
      if (!recipe) return;
      
      const updatedRecipe = { ...recipe, isFavorite };
      await updateRecipe(id, updatedRecipe);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Failed to update favorite status');
      throw error;
    }
  }, [getRecipeById, updateRecipe]);

  const value = useMemo(() => ({
    recipes,
    setRecipes,
    addRecipe,
    updateRecipe,
    removeRecipe,
    getRecipeById,
    getRecipeBySlug,
    isLoading,
    setIsLoading,
    error,
    fetchRecipes,
    createRecipe,
    deleteRecipe,
    toggleFavorite,
  }), [recipes, addRecipe, updateRecipe, removeRecipe, getRecipeById, getRecipeBySlug, isLoading, error, fetchRecipes, createRecipe, deleteRecipe, toggleFavorite]);

  return (
    <RecipesContext.Provider value={value}>
      {children}
    </RecipesContext.Provider>
  );
};
