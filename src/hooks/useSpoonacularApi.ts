
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SpoonacularRecipe {
  id: number;
  title: string;
  image?: string;
  readyInMinutes?: number;
  servings?: number;
  sourceUrl?: string;
  summary?: string;
  extendedIngredients?: Array<{
    original: string;
    name: string;
    amount: number;
    unit: string;
  }>;
  analyzedInstructions?: Array<{
    steps: Array<{
      number: number;
      step: string;
    }>;
  }>;
  diets?: string[];
  cuisines?: string[];
}

interface SearchFilters {
  query?: string;
  diet?: string;
  cuisine?: string;
  type?: string;
  maxReadyTime?: number;
  number?: number;
}

export function useSpoonacularApi() {
  const [recipes, setRecipes] = useState<SpoonacularRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchRecipes = useCallback(async (filters: SearchFilters) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('spoonacular-api', {
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

  const getPopularRecipes = useCallback(async (number: number = 12) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('spoonacular-api', {
        body: {
          action: 'popular',
          number
        }
      });

      if (error) throw error;

      setRecipes(data.recipes || []);
    } catch (error) {
      console.error('Error getting popular recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load popular recipes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getRecipeDetails = useCallback(async (recipeId: number): Promise<SpoonacularRecipe | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('spoonacular-api', {
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
    getPopularRecipes,
    getRecipeDetails,
  };
}
