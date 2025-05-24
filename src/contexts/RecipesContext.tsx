
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Recipe } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRecipeApi } from "@/hooks/useRecipeApi";
import { RecipesContextType } from "@/types/recipe";

const RecipesContext = createContext<RecipesContextType | undefined>(undefined);

export const RecipesProvider = ({ children }: { children: ReactNode }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const recipeApi = useRecipeApi();

  const fetchRecipes = useCallback(async (householdId: string | null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedRecipes = await recipeApi.fetchRecipes(householdId);
      setRecipes(fetchedRecipes);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError("Failed to fetch recipes. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to fetch recipes. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [recipeApi.fetchRecipes, toast]);

  const createRecipe = async (
    recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>, 
    householdId: string
  ): Promise<Recipe | null> => {
    try {
      const newRecipe = await recipeApi.createRecipe(recipeData, householdId);
      if (newRecipe) {
        setRecipes(prev => [newRecipe, ...prev]);
      }
      return newRecipe;
    } catch (err) {
      console.error("Error creating recipe:", err);
      toast({
        title: "Error",
        description: "Failed to create recipe. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateRecipe = async (id: string, recipeData: Partial<Recipe>): Promise<Recipe | null> => {
    try {
      const updatedRecipe = await recipeApi.updateRecipe(id, recipeData);
      if (updatedRecipe) {
        setRecipes(prev => prev.map(recipe => 
          recipe.id === id ? updatedRecipe : recipe
        ));
      }
      return updatedRecipe;
    } catch (err) {
      console.error("Error updating recipe:", err);
      toast({
        title: "Error",
        description: "Failed to update recipe. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteRecipe = async (id: string): Promise<boolean> => {
    try {
      const success = await recipeApi.deleteRecipe(id);
      if (success) {
        setRecipes(prev => prev.filter(recipe => recipe.id !== id));
      }
      return success;
    } catch (err) {
      console.error("Error deleting recipe:", err);
      toast({
        title: "Error",
        description: "Failed to delete recipe. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getRecipeById = (id: string) => {
    return recipes.find(recipe => recipe.id === id);
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('recipes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recipes',
        },
        () => {
          // Refetch recipes when changes occur - this will be handled by the page component
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <RecipesContext.Provider value={{ 
      recipes, 
      isLoading, 
      error, 
      fetchRecipes, 
      getRecipeById,
      createRecipe,
      updateRecipe,
      deleteRecipe
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
