import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ImportedRecipe } from "@/services/importedRecipeService";

interface UseFeaturedRecipesFilters {
  keyword?: string;
  mealTypes?: string[];
  cuisineTypes?: string[];
  cookingDurations?: string[];
  dietLifestyle?: string[];
}

interface UseFeaturedRecipesOptions {
  initialFilters?: UseFeaturedRecipesFilters;
}

export function useFeaturedRecipes(options: UseFeaturedRecipesOptions = {}) {
  const [page, setPage] = useState(0);
  const [allRecipes, setAllRecipes] = useState<ImportedRecipe[]>([]);
  const RECIPES_PER_PAGE = 12;

  const filters = options.initialFilters || {};

  const { data, isLoading, error } = useQuery({
    queryKey: ['featured-recipes', filters, page],
    queryFn: async () => {
      let query = supabase
        .from('imported_recipes')
        .select('*')
        .eq('is_featured', true);

      // Apply filters
      if (filters.keyword) {
        query = query.or(`title.ilike.%${filters.keyword}%,description.ilike.%${filters.keyword}%`);
      }

      if (filters.mealTypes && filters.mealTypes.length > 0) {
        query = query.overlaps('meal_types', filters.mealTypes);
      }

      if (filters.cuisineTypes && filters.cuisineTypes.length > 0) {
        query = query.in('cuisine_region', filters.cuisineTypes as any);
      }

      if (filters.dietLifestyle && filters.dietLifestyle.length > 0) {
        query = query.overlaps('diet_lifestyle', filters.dietLifestyle);
      }

      if (filters.cookingDurations && filters.cookingDurations.length > 0) {
        const maxDurations = filters.cookingDurations.map(d => {
          if (d === 'under-15') return 15;
          if (d === '15-30') return 30;
          if (d === '30-60') return 60;
          return 999;
        });
        const maxDuration = Math.max(...maxDurations);
        query = query.lte('prep_time', maxDuration).lte('cook_time', maxDuration);
      }

      query = query
        .order('priority_score', { ascending: false })
        .order('created_at', { ascending: false })
        .range(page * RECIPES_PER_PAGE, (page + 1) * RECIPES_PER_PAGE - 1);

      const { data, error } = await query;

      if (error) throw error;
      return data as ImportedRecipe[];
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  // Update recipes when new data arrives
  useEffect(() => {
    if (data) {
      if (page === 0) {
        setAllRecipes(data);
      } else {
        setAllRecipes(prev => [...prev, ...data]);
      }
    }
  }, [data, page]);

  // Reset when filters change - use stable serialization to avoid unnecessary resets
  useEffect(() => {
    setPage(0);
    setAllRecipes([]);
  }, [
    filters.keyword || '',
    JSON.stringify(filters.mealTypes || []),
    JSON.stringify(filters.cuisineTypes || []),
    JSON.stringify(filters.dietLifestyle || []),
    JSON.stringify(filters.cookingDurations || []),
  ]);

  const loadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const hasMore = data && data.length === RECIPES_PER_PAGE;

  return {
    recipes: allRecipes,
    isLoading: isLoading && page === 0,
    isLoadingMore: isLoading && page > 0,
    error,
    hasMore,
    loadMore,
    total: allRecipes.length,
  };
}
