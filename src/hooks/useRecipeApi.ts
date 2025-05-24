
import { Recipe } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback } from "react";
import { 
  transformDbRecipeToRecipe, 
  transformRecipeToDbInsert, 
  transformRecipeToDbUpdate 
} from "@/utils/recipeTransformers";

export const useRecipeApi = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchRecipes = useCallback(async (householdId: string | null): Promise<Recipe[]> => {
    if (!user || !householdId) {
      return [];
    }

    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(transformDbRecipeToRecipe);
  }, [user]);

  const createRecipe = useCallback(async (
    recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>, 
    householdId: string
  ): Promise<Recipe | null> => {
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
      .insert([transformRecipeToDbInsert(recipeData, user.id, householdId)])
      .select()
      .single();

    if (error) {
      throw error;
    }

    const newRecipe = transformDbRecipeToRecipe(data);
    
    toast({
      title: "Recipe Created",
      description: `${newRecipe.title} has been saved to your household collection.`,
    });

    return newRecipe;
  }, [user, toast]);

  const updateRecipe = useCallback(async (id: string, recipeData: Partial<Recipe>): Promise<Recipe | null> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to update recipes.",
        variant: "destructive",
      });
      return null;
    }

    const updateData = transformRecipeToDbUpdate(recipeData);

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

    const updatedRecipe = transformDbRecipeToRecipe(data);

    toast({
      title: "Recipe Updated",
      description: `${updatedRecipe.title} has been updated.`,
    });

    return updatedRecipe;
  }, [user, toast]);

  const deleteRecipe = useCallback(async (id: string): Promise<boolean> => {
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

    toast({
      title: "Recipe Deleted",
      description: "Recipe has been removed from your collection.",
    });

    return true;
  }, [user, toast]);

  return {
    fetchRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  };
};
