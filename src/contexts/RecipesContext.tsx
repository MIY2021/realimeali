
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Recipe } from '@/types';
import { useRecipeApi } from '@/hooks/useRecipeApi';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
  const { currentHousehold } = useHousehold();
  const api = useRecipeApi();

  const fetchRecipes = useCallback(async (householdId: string | null) => {
    if (!householdId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const fetchedRecipes = await api.fetchRecipes(householdId);
      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setError('Failed to load recipes');
      toast({
        title: "Error",
        description: "Failed to load recipes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [api, toast]);

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
      toast({
        title: "Error",
        description: "Failed to create recipe",
        variant: "destructive",
      });
      return null;
    }
  }, [api, toast]);

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
      toast({
        title: "Error",
        description: "Failed to update recipe",
        variant: "destructive",
      });
      return null;
    }
  }, [api, getRecipeById, toast]);

  const deleteRecipe = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await api.deleteRecipe(id);
      if (success) {
        setRecipes(prev => prev.filter(recipe => recipe.id !== id));
        toast({
          title: "Success",
          description: "Recipe deleted successfully",
        });
      }
      return success;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: "Error",
        description: "Failed to delete recipe",
        variant: "destructive",
      });
      return false;
    }
  }, [api, toast]);

  const toggleFavorite = useCallback(async (id: string, isFavorite: boolean): Promise<Recipe | null> => {
    return updateRecipe(id, { is_favorite: isFavorite });
  }, [updateRecipe]);

  const toggleCookingStatus = useCallback(async (id: string): Promise<Recipe | null> => {
    const existingRecipe = getRecipeById(id);
    if (!existingRecipe || !currentHousehold) return null;

    try {
      const newCookingStatus = await api.toggleCookingStatus(id, currentHousehold.id);
      const updatedRecipe = { ...existingRecipe, has_cooked: newCookingStatus };
      
      setRecipes(prev => prev.map(recipe => 
        recipe.id === id ? updatedRecipe : recipe
      ));

      toast({
        title: "Success",
        description: `Recipe marked as ${newCookingStatus ? 'cooked' : 'not cooked'}`,
      });

      return updatedRecipe;
    } catch (error) {
      console.error('Error toggling cooking status:', error);
      toast({
        title: "Error",
        description: "Failed to update cooking status",
        variant: "destructive",
      });
      return null;
    }
  }, [api, getRecipeById, currentHousehold, toast]);

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
