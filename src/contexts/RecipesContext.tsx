
import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { Recipe } from '@/types';
import { useRecipeApi } from '@/hooks/useRecipeApi';

interface RecipesContextType {
  recipes: Recipe[];
  setRecipes: (recipes: Recipe[]) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, recipe: Recipe) => void;
  removeRecipe: (id: string) => void;
  getRecipeById: (id: string) => Recipe | undefined;
  getRecipeBySlug: (slug: string) => Recipe | undefined;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  // Add missing methods
  fetchRecipes: (householdId: string | null) => Promise<void>;
  createRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>, householdId: string) => Promise<Recipe | null>;
  deleteRecipe: (id: string) => Promise<boolean>;
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
  const recipeApi = useRecipeApi();

  const addRecipe = useCallback((recipe: Recipe) => {
    setRecipes(prev => [recipe, ...prev]);
  }, []);

  const updateRecipe = useCallback((id: string, updatedRecipe: Recipe) => {
    setRecipes(prev => prev.map(recipe => 
      recipe.id === id ? updatedRecipe : recipe
    ));
  }, []);

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
    try {
      const fetchedRecipes = await recipeApi.fetchRecipes(householdId);
      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [recipeApi]);

  const createRecipe = useCallback(async (
    recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>, 
    householdId: string
  ) => {
    try {
      const newRecipe = await recipeApi.createRecipe(recipeData, householdId);
      if (newRecipe) {
        addRecipe(newRecipe);
      }
      return newRecipe;
    } catch (error) {
      console.error('Error creating recipe:', error);
      return null;
    }
  }, [recipeApi, addRecipe]);

  const deleteRecipe = useCallback(async (id: string) => {
    try {
      const success = await recipeApi.deleteRecipe(id);
      if (success) {
        removeRecipe(id);
      }
      return success;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      return false;
    }
  }, [recipeApi, removeRecipe]);

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
    fetchRecipes,
    createRecipe,
    deleteRecipe,
  }), [recipes, addRecipe, updateRecipe, removeRecipe, getRecipeById, getRecipeBySlug, isLoading, fetchRecipes, createRecipe, deleteRecipe]);

  return (
    <RecipesContext.Provider value={value}>
      {children}
    </RecipesContext.Provider>
  );
};
