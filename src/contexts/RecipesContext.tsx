import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Recipe } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface RecipesContextType {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  fetchRecipes: (householdId: string | null) => Promise<void>;
  getRecipeById: (id: string) => Recipe | undefined;
  createRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>, householdId: string) => Promise<Recipe | null>;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => Promise<Recipe | null>;
  deleteRecipe: (id: string) => Promise<boolean>;
}

const RecipesContext = createContext<RecipesContextType | undefined>(undefined);

export const RecipesProvider = ({ children }: { children: ReactNode }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchRecipes = async (householdId: string | null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user || !householdId) {
        setRecipes([]);
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transform database format to Recipe type
      const transformedRecipes: Recipe[] = (data || []).map(dbRecipe => ({
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
        isFavorite: dbRecipe.is_favorite || false,
        createdBy: dbRecipe.user_id,
        createdAt: dbRecipe.created_at,
        updatedAt: dbRecipe.updated_at
      }));

      setRecipes(transformedRecipes);
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
  };

  const createRecipe = async (recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>, householdId: string): Promise<Recipe | null> => {
    try {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to create recipes.",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('recipes')
        .insert([{
          title: recipeData.title,
          description: recipeData.description,
          ingredients: recipeData.ingredients,
          instructions: recipeData.instructions,
          categories: recipeData.categories,
          prep_time: recipeData.prepTime,
          cook_time: recipeData.cookTime,
          servings: recipeData.servings,
          image: recipeData.image,
          is_favorite: recipeData.isFavorite,
          user_id: user.id,
          household_id: householdId
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newRecipe: Recipe = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        ingredients: data.ingredients || [],
        instructions: data.instructions || [],
        categories: data.categories || [],
        prepTime: data.prep_time || 0,
        cookTime: data.cook_time || 0,
        servings: data.servings || 1,
        image: data.image || undefined,
        isFavorite: data.is_favorite || false,
        createdBy: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setRecipes(prev => [newRecipe, ...prev]);
      
      toast({
        title: "Recipe Created",
        description: `${newRecipe.title} has been saved to your household collection.`,
      });

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
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to update recipes.",
          variant: "destructive",
        });
        return null;
      }

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
      if (recipeData.isFavorite !== undefined) updateData.is_favorite = recipeData.isFavorite;

      const { data, error } = await supabase
        .from('recipes')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const updatedRecipe: Recipe = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        ingredients: data.ingredients || [],
        instructions: data.instructions || [],
        categories: data.categories || [],
        prepTime: data.prep_time || 0,
        cookTime: data.cook_time || 0,
        servings: data.servings || 1,
        image: data.image || undefined,
        isFavorite: data.is_favorite || false,
        createdBy: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setRecipes(prev => prev.map(recipe => 
        recipe.id === id ? updatedRecipe : recipe
      ));

      toast({
        title: "Recipe Updated",
        description: `${updatedRecipe.title} has been updated.`,
      });

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
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to delete recipes.",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setRecipes(prev => prev.filter(recipe => recipe.id !== id));
      
      toast({
        title: "Recipe Deleted",
        description: "Recipe has been removed from your collection.",
      });

      return true;
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

  useEffect(() => {
    if (!user) return;

    fetchRecipes(null);
  }, [user]);

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
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refetch recipes when changes occur
          // fetchRecipes(); // was previously without household ID
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
