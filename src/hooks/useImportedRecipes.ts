import { useState, useEffect, useCallback } from 'react';
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
      setTotalCount(data.total);
      
      if (page === 0) {
        // First page - replace all recipes
        setAllRecipes(data.recipes);
      } else {
        // Additional pages - append new recipes
        setAllRecipes(prev => {
          const existingIds = new Set(prev.map(recipe => recipe.id));
          const newRecipes = data.recipes.filter(recipe => !existingIds.has(recipe.id));
          return [...prev, ...newRecipes];
        });
      }

      // Update hasMore based on returned data
      setHasMore(data.recipes.length === pageSize);
    }
  }, [data, page]);

  // Reset when filters change
  useEffect(() => {
    setPage(0);
    setAllRecipes([]);
    setHasMore(true);
    setTotalCount(0);
  }, [
    filters.keyword,
    filters.mealType,
    filters.cuisineType,
    filters.diet,
    filters.time
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
    isLoading: isLoading && page === 0, // Only show loading for first page
    error,
    hasMore,
    loadMore,
    refetch,
    total: totalCount
  };
}