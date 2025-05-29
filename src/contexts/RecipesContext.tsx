import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Recipe } from "@/types";
import { RecipesContextType } from "@/types/recipe";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useToast } from "@/hooks/use-toast";
import { useRecipeApi } from "@/hooks/useRecipeApi";
import { generateSlug } from "@/utils/slugUtils";

const RecipesContext = createContext<RecipesContextType | undefined>(undefined);

export const RecipesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { toast } = useToast();
  const { fetchRecipes: apiFetchRecipes, createRecipe: apiCreateRecipe, updateRecipe: apiUpdateRecipe, deleteRecipe: apiDeleteRecipe } = useRecipeApi();
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = async (householdId: string | null) => {
    if (!householdId) {
      setRecipes([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const fetchedRecipes = await apiFetchRecipes(householdId);
      setRecipes(fetchedRecipes);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError("Failed to fetch recipes");
      toast({
        title: "Error",
        description: "Failed to fetch recipes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createRecipe = async (
    recipeData: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>, 
    householdId: string
  ): Promise<Recipe | null> => {
    try {
      setError(null);
      
      const recipeWithSlug = {
        ...recipeData,
        slug: generateSlug(recipeData.title),
      };
      
      const newRecipe = await apiCreateRecipe(recipeWithSlug, householdId);
      
      if (newRecipe) {
        setRecipes(prev => [newRecipe, ...prev]);
        toast({
          title: "Success",
          description: "Recipe created successfully!",
        });
      }
      
      return newRecipe;
    } catch (err) {
      console.error("Error creating recipe:", err);
      setError("Failed to create recipe");
      toast({
        title: "Error",
        description: "Failed to create recipe. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateRecipe = async (id: string, recipe: Partial<Recipe>): Promise<Recipe | null> => {
    try {
      setError(null);
      const updatedRecipe = await apiUpdateRecipe(id, recipe);
      if (updatedRecipe) {
        setRecipes(prev =>
          prev.map(r => (r.id === id ? { ...r, ...updatedRecipe } : r))
        );
        toast({
          title: "Success",
          description: "Recipe updated successfully!",
        });
      }
      return updatedRecipe;
    } catch (err) {
      console.error("Error updating recipe:", err);
      setError("Failed to update recipe");
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
      setError(null);
      const success = await apiDeleteRecipe(id);
      if (success) {
        setRecipes(prev => prev.filter(recipe => recipe.id !== id));
        toast({
          title: "Success",
          description: "Recipe deleted successfully!",
        });
      }
      return success;
    } catch (err) {
      console.error("Error deleting recipe:", err);
      setError("Failed to delete recipe");
      toast({
        title: "Error",
        description: "Failed to delete recipe. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleFavorite = async (id: string, isFavorite: boolean): Promise<Recipe | null> => {
    try {
      setError(null);
      const updatedRecipe = await apiUpdateRecipe(id, { is_favorite: isFavorite });
      
      if (updatedRecipe) {
        setRecipes(prev =>
          prev.map(r => (r.id === id ? { ...r, ...updatedRecipe } : r))
        );
      }
      
      return updatedRecipe;
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setError("Failed to toggle favorite");
      toast({
        title: "Error",
        description: "Failed to toggle favorite. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const getRecipeById = (id: string): Recipe | undefined => {
    return recipes.find(recipe => recipe.id === id);
  };

  const getRecipeBySlug = (slug: string): Recipe | undefined => {
    return recipes.find(recipe => recipe.slug === slug);
  };

  useEffect(() => {
    fetchRecipes(currentHousehold?.id || null);
  }, [currentHousehold?.id]);

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
