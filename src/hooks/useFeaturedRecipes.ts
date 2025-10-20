import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ImportedRecipe } from "@/services/importedRecipeService";

interface UseFeaturedRecipesFilters {
  keyword?: string;
  sortBy?: string;
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

  // Note: filterKey uses stable string dependencies to prevent unnecessary resets
  // caused by React's object identity checks. This ensures the recipe list
  // doesn't flicker or disappear unexpectedly.
  const filterKey = useMemo(() => 
    JSON.stringify({
      keyword: filters.keyword || '',
      sortBy: filters.sortBy || 'priority',
      mealTypes: filters.mealTypes || [],
      cuisineTypes: filters.cuisineTypes || [],
      dietLifestyle: filters.dietLifestyle || [],
      cookingDurations: filters.cookingDurations || [],
    }),
    [
      filters.keyword,
      filters.sortBy,
      filters.mealTypes?.join(','),
      filters.cuisineTypes?.join(','),
      filters.dietLifestyle?.join(','),
      filters.cookingDurations?.join(','),
    ]
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ['featured-recipes', filterKey, page],
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

      // Apply sorting
      let orderColumn = 'priority_score';
      let ascending = false;

      if (filters.sortBy === 'newest') {
        orderColumn = 'created_at';
        ascending = false;
      } else if (filters.sortBy === 'oldest') {
        orderColumn = 'created_at';
        ascending = true;
      } else {
        // 'priority' or default
        orderColumn = 'priority_score';
        ascending = false;
      }

      query = query
        .order(orderColumn, { ascending })
        .range(page * RECIPES_PER_PAGE, (page + 1) * RECIPES_PER_PAGE - 1);

      const { data, error } = await query;

      if (error) throw error;
      return data as ImportedRecipe[];
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  // Track the previous filterKey to detect changes
  const prevFilterKeyRef = useRef(filterKey);

  // Update recipes when new data arrives
  useEffect(() => {
    // If filterKey changed, reset everything
    if (prevFilterKeyRef.current !== filterKey) {
      setPage(0);
      setAllRecipes([]);
      prevFilterKeyRef.current = filterKey;
    }
    
    // Now update recipes based on current data
    if (data) {
      if (page === 0) {
        setAllRecipes(data);
      } else {
        setAllRecipes(prev => [...prev, ...data]);
      }
    }
  }, [data, page, filterKey]);


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
