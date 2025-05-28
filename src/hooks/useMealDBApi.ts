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
  ingredient?: string;
  letter?: string;
  number?: number;
  offset?: number;
}

interface MealDBApiResponse {
  recipes: MealDBRecipe[];
  totalCount: number;
  hasMore: boolean;
  estimatedTotal?: number;
}

export function useMealDBApi() {
  const [recipes, setRecipes] = useState<MealDBRecipe[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [estimatedTotal, setEstimatedTotal] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchRecipes = useCallback(async (filters: SearchFilters, append = false) => {
    setIsLoading(true);
    try {
      console.log('Searching recipes with filters:', filters);
      const { data, error } = await supabase.functions.invoke('mealdb-api', {
        body: {
          action: 'search',
          ...filters
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('API response:', data);
      const response: MealDBApiResponse = data;
      
      if (append) {
        setRecipes(prev => [...prev, ...response.recipes]);
      } else {
        setRecipes(response.recipes);
      }
      
      setTotalCount(response.totalCount);
      setHasMore(response.hasMore);
      setEstimatedTotal(response.estimatedTotal);
      
      if (!append && response.recipes?.length === 0) {
        toast({
          title: "No recipes found",
          description: "Try adjusting your search terms or filters.",
        });
      }
    } catch (error) {
      console.error('Error searching recipes:', error);
      toast({
        title: "Error",
        description: "Failed to search recipes. Please try again.",
        variant: "destructive",
      });
      if (!append) {
        setRecipes([]);
        setTotalCount(0);
        setHasMore(false);
        setEstimatedTotal(undefined);
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadMoreRecipes = useCallback(async (filters: SearchFilters) => {
    if (!hasMore || isLoading) return;
    
    const currentOffset = recipes.length;
    await searchRecipes({ ...filters, offset: currentOffset }, true);
  }, [searchRecipes, hasMore, isLoading, recipes.length]);

  const getRandomRecipes = useCallback(async (number: number = 12, append = false) => {
    setIsLoading(true);
    try {
      console.log('Getting random recipes, count:', number);
      const { data, error } = await supabase.functions.invoke('mealdb-api', {
        body: {
          action: 'random',
          number
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('API response:', data);
      const response: MealDBApiResponse = data;
      
      if (append) {
        setRecipes(prev => [...prev, ...response.recipes]);
      } else {
        setRecipes(response.recipes);
      }
      
      setTotalCount(response.recipes.length);
      setHasMore(response.hasMore);
      setEstimatedTotal(response.estimatedTotal);
    } catch (error) {
      console.error('Error getting random recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load recipes. Please try again.",
        variant: "destructive",
      });
      if (!append) {
        setRecipes([]);
        setTotalCount(0);
        setHasMore(false);
        setEstimatedTotal(undefined);
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadMoreRandomRecipes = useCallback(async (number: number = 12) => {
    if (!hasMore || isLoading) return;
    await getRandomRecipes(number, true);
  }, [getRandomRecipes, hasMore, isLoading]);

  const getRecipeDetails = useCallback(async (recipeId: string): Promise<MealDBRecipe | null> => {
    try {
      console.log('Getting recipe details for:', recipeId);
      const { data, error } = await supabase.functions.invoke('mealdb-api', {
        body: {
          action: 'details',
          recipeId
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Recipe details response:', data);
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

  const getIngredients = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('mealdb-api', {
        body: { action: 'ingredients' }
      });

      if (error) throw error;
      return data.ingredients || [];
    } catch (error) {
      console.error('Error getting ingredients:', error);
      return [];
    }
  }, []);

  const getCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('mealdb-api', {
        body: { action: 'categories' }
      });

      if (error) throw error;
      return data.categories || [];
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }, []);

  const getAreas = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('mealdb-api', {
        body: { action: 'areas' }
      });

      if (error) throw error;
      return data.areas || [];
    } catch (error) {
      console.error('Error getting areas:', error);
      return [];
    }
  }, []);

  return {
    recipes,
    totalCount,
    hasMore,
    estimatedTotal,
    isLoading,
    searchRecipes,
    loadMoreRecipes,
    getRandomRecipes,
    loadMoreRandomRecipes,
    getRecipeDetails,
    getIngredients,
    getCategories,
    getAreas,
  };
}
