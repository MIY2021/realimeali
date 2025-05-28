
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MealDBRecipe {
  id: string;
  title: string;
  image?: string;
  category: string;
  area: string;
  instructions: string[];
  ingredients: string[];
  tags?: string[];
  sourceUrl?: string;
  videoUrl?: string;
  readyInMinutes?: number;
  servings?: number;
  diets?: string[];
  cuisines?: string[];
}

interface SearchFilters {
  query?: string;
  category?: string;
  area?: string;
  number?: number;
}

export function useMealDBApi() {
  const [recipes, setRecipes] = useState<MealDBRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchRecipes = useCallback(async (filters: SearchFilters) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mealdb-api', {
        body: {
          action: 'search',
          ...filters
        }
      });

      if (error) throw error;

      setRecipes(data.recipes || []);
    } catch (error) {
      console.error('Error searching recipes:', error);
      toast({
        title: "Error",
        description: "Failed to search recipes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getRandomRecipes = useCallback(async (number: number = 12) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mealdb-api', {
        body: {
          action: 'random',
          number
        }
      });

      if (error) throw error;

      setRecipes(data.recipes || []);
    } catch (error) {
      console.error('Error getting random recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load recipes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getRecipeDetails = useCallback(async (recipeId: string): Promise<MealDBRecipe | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('mealdb-api', {
        body: {
          action: 'details',
          recipeId
        }
      });

      if (error) throw error;

      return data.recipes?.[0] || null;
    } catch (error) {
      console.error('Error getting recipe details:', error);
      toast({
        title: "Error",
        description: "Failed to load recipe details. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  return {
    recipes,
    isLoading,
    searchRecipes,
    getRandomRecipes,
    getRecipeDetails,
  };
}
