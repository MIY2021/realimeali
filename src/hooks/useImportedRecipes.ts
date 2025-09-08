import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  fetchImportedRecipesWithTotal, 
  ImportedRecipe, 
  ImportedRecipeFilters,
  convertFiltersToImported 
} from '@/services/importedRecipeService';
import { DiscoverRecipeFilters } from '@/types/edamam';
import { useToast } from '@/hooks/use-toast';

interface UseImportedRecipesResult {
  recipes: ImportedRecipe[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
  total: number;
}

export function useImportedRecipes(
  filters: DiscoverRecipeFilters = {}
): UseImportedRecipesResult {
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const [allRecipes, setAllRecipes] = useState<ImportedRecipe[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Track previous filter values to detect actual changes
  const previousFiltersRef = useRef<DiscoverRecipeFilters>({});
  
  const pageSize = 20;

  // Convert external filters to imported recipe filters
  const importedFilters: ImportedRecipeFilters = {
    ...convertFiltersToImported(filters),
    limit: pageSize,
    offset: page * pageSize
  };

  const {
    data,
    isLoading,
    error,
    refetch: queryRefetch
  } = useQuery({
    queryKey: ['imported-recipes', importedFilters, page],
    queryFn: () => fetchImportedRecipesWithTotal(importedFilters),
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });

  // Update recipes when new data arrives
  useEffect(() => {
    if (data) {
      console.log('Data received:', { recipesCount: data.recipes.length, total: data.total, page });
      setTotalCount(data.total);
      
      if (page === 0) {
        // First page - replace all recipes
        setAllRecipes(data.recipes);
        console.log('Set initial recipes:', data.recipes.length);
      } else {
        // Additional pages - append new recipes
        setAllRecipes(prev => {
          const existingIds = new Set(prev.map(recipe => recipe.id));
          const newRecipes = data.recipes.filter(recipe => !existingIds.has(recipe.id));
          const updated = [...prev, ...newRecipes];
          console.log('Appended recipes:', { previous: prev.length, new: newRecipes.length, total: updated.length });
          return updated;
        });
      }

      // Update hasMore based on returned data
      setHasMore(data.recipes.length === pageSize);
      setIsInitialized(true);
    }
  }, [data, page]);

  // Reset when filters actually change (not on initial mount)
  useEffect(() => {
    const currentFilters = {
      keyword: filters.keyword,
      mealType: filters.mealType,
      cuisineType: filters.cuisineType,
      diet: filters.diet,
      time: filters.time
    };
    
    // Only reset if we're initialized and filters have actually changed
    if (isInitialized) {
      const prevFilters = previousFiltersRef.current;
      const hasChanged = 
        prevFilters.keyword !== currentFilters.keyword ||
        prevFilters.mealType !== currentFilters.mealType ||
        prevFilters.cuisineType !== currentFilters.cuisineType ||
        prevFilters.diet !== currentFilters.diet ||
        prevFilters.time !== currentFilters.time;
      
      if (hasChanged) {
        console.log('Filters changed, resetting state:', { prev: prevFilters, current: currentFilters });
        setPage(0);
        setAllRecipes([]);
        setHasMore(true);
        setTotalCount(0);
      }
    }
    
    // Update the ref with current filters
    previousFiltersRef.current = currentFilters;
  }, [
    filters.keyword,
    filters.mealType,
    filters.cuisineType,
    filters.diet,
    filters.time,
    isInitialized
  ]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, isLoading]);

  const refetch = useCallback(() => {
    setPage(0);
    setAllRecipes([]);
    setHasMore(true);
    setTotalCount(0);
    queryRefetch();
  }, [queryRefetch]);

  return {
    recipes: allRecipes,
    isLoading: (isLoading && page === 0) || !isInitialized, // Show loading during initial load
    error,
    hasMore,
    loadMore,
    refetch,
    total: totalCount
  };
}