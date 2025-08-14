import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DiscoverRecipeFilters, EdamamHit, PaginatedEdamamResponse } from "@/types/edamam";
import { useToast } from "@/hooks/use-toast";

interface PaginationState {
  recipes: EdamamHit[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  totalFetched: number;
  totalAvailable: number;
}


export function useEdamamApiPagination(baseFilters: Omit<DiscoverRecipeFilters, 'from' | 'to'>) {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(0);
  const [allRecipes, setAllRecipes] = useState<EdamamHit[]>([]);
  const [hasMoreRecipes, setHasMoreRecipes] = useState(true);
  const [totalFetched, setTotalFetched] = useState(0);
  const [apiTotalAvailable, setApiTotalAvailable] = useState(0);

  const MAX_RECIPES = 100; // API limit per search session

  const pageSizeFor = (page: number) => (page === 0 ? 20 : 10);
  const computeFrom = (page: number) => (page === 0 ? 0 : 20 + (page - 1) * 10);
  const computeTo = (page: number) => Math.min(computeFrom(page) + pageSizeFor(page), MAX_RECIPES);

  const { data, isLoading, error } = useQuery({
    queryKey: ['edamam-recipes-paginated', baseFilters, currentPage],
    queryFn: async (): Promise<PaginatedEdamamResponse> => {
      try {
        const filters: DiscoverRecipeFilters = {
          ...baseFilters,
          from: computeFrom(currentPage),
          to: computeTo(currentPage)
        };

        const { data, error } = await supabase.functions.invoke('discover-recipes', {
          body: { filters }
        });

        if (error) {
          console.error('Edamam API error:', error);
          throw new Error(error.message || 'Failed to fetch recipes');
        }

        return data as PaginatedEdamamResponse;
      } catch (error) {
        console.error('Error calling discover-recipes function:', error);
        toast({
          title: "Error fetching recipes",
          description: "Please try again in a moment. We may have hit our rate limit.",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: !!(
      baseFilters.keyword || 
      baseFilters.mealType || 
      baseFilters.cuisineType || 
      baseFilters.diet?.length || 
      baseFilters.time
    ),
    staleTime: 1000 * 60 * 15, // 15 minutes for fresher results
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 1,
  });

  // Update recipes when new data arrives
  useEffect(() => {
    if (data?.hits) {
      if (currentPage === 0) {
        // First page - replace all recipes
        setAllRecipes(data.hits);
      } else {
        // Additional pages - append new recipes, filter duplicates
        setAllRecipes(prev => {
          const existingUris = new Set(prev.map(hit => hit.recipe.uri));
          const newRecipes = data.hits.filter(hit => !existingUris.has(hit.recipe.uri));
          return [...prev, ...newRecipes];
        });
      }
      setHasMoreRecipes(!!data.hasMore && (allRecipes.length + data.hits.length) < MAX_RECIPES);
      setTotalFetched(data.totalFetched || 0);
      setApiTotalAvailable(typeof (data as any).count === 'number' ? (data as any).count : 0);
    }
  }, [data, currentPage, allRecipes.length]);

  // Reset when filters change
  useEffect(() => {
    setCurrentPage(0);
    setAllRecipes([]);
    setHasMoreRecipes(true);
    setTotalFetched(0);
  }, [baseFilters.keyword, baseFilters.mealType, baseFilters.cuisineType, baseFilters.diet, baseFilters.time]);

  const loadMore = useCallback(async () => {
    if (!hasMoreRecipes || isLoading || totalFetched >= MAX_RECIPES) return;
    
    setCurrentPage(prev => prev + 1);
  }, [hasMoreRecipes, isLoading, totalFetched]);

  const reset = useCallback(() => {
    setCurrentPage(0);
    setAllRecipes([]);
    setHasMoreRecipes(true);
    setTotalFetched(0);
    setApiTotalAvailable(0);
  }, []);

  const state: PaginationState = {
    recipes: allRecipes,
    isLoading: isLoading && currentPage === 0,
    isLoadingMore: isLoading && currentPage > 0,
    hasMore: hasMoreRecipes,
    error: error as Error | null,
    totalFetched,
    totalAvailable: apiTotalAvailable,
  };

  return {
    ...state,
    loadMore,
    reset
  };
}