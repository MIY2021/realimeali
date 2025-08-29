import { supabase } from "@/integrations/supabase/client";
import { DiscoverRecipeFilters } from "@/types/edamam";

export interface ImportedRecipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  image?: string;
  meal_types: string[];
  cuisine_region?: string;
  diet_lifestyle?: string[];
  source_url?: string;
  import_method: string;
  top_tip?: string;
  fruit_veg_portions?: number;
  fruit_veg_breakdown?: string;
  fruit_veg_total_grams?: number;
  is_featured: boolean;
  priority_score: number;
  view_count: number;
  add_count: number;
  imported_by: string;
  created_at: string;
  updated_at: string;
}

export interface ImportedRecipeFilters {
  keyword?: string;
  mealTypes?: string[];
  cuisineTypes?: string[];
  cookingDurations?: string[];
  dietLifestyle?: string[];
  limit?: number;
  offset?: number;
}

export interface ImportedRecipesResult {
  recipes: ImportedRecipe[];
  total: number;
}

export const fetchImportedRecipes = async (filters: ImportedRecipeFilters = {}): Promise<ImportedRecipe[]> => {
  let query = supabase
    .from('imported_recipes' as any)
    .select('*');

  // Apply filters
  if (filters.keyword) {
    query = query.or(`title.ilike.%${filters.keyword}%,description.ilike.%${filters.keyword}%`);
  }

  if (filters.mealTypes && filters.mealTypes.length > 0) {
    query = query.overlaps('meal_types', filters.mealTypes);
  }

  if (filters.cuisineTypes && filters.cuisineTypes.length > 0) {
    query = query.in('cuisine_region', filters.cuisineTypes);
  }

  if (filters.dietLifestyle && filters.dietLifestyle.length > 0) {
    query = query.overlaps('diet_lifestyle', filters.dietLifestyle);
  }

  if (filters.cookingDurations && filters.cookingDurations.length > 0) {
    // Convert cooking duration filters to time ranges
    const timeConditions: string[] = [];
    filters.cookingDurations.forEach(duration => {
      switch (duration) {
        case '0-30':
          timeConditions.push('(prep_time + cook_time) <= 30');
          break;
        case '30-60':
          timeConditions.push('(prep_time + cook_time) > 30 AND (prep_time + cook_time) <= 60');
          break;
        case '60+':
          timeConditions.push('(prep_time + cook_time) > 60');
          break;
      }
    });
    if (timeConditions.length > 0) {
      query = query.or(timeConditions.join(','));
    }
  }

  // Apply pagination
  if (filters.offset) {
    query = query.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1);
  } else if (filters.limit) {
    query = query.limit(filters.limit);
  }

  // Order by featured status, priority, and creation date
  query = query.order('is_featured', { ascending: false })
              .order('priority_score', { ascending: false })
              .order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching imported recipes:', error);
    throw new Error(`Failed to fetch imported recipes: ${error.message}`);
  }

  return (data || []) as unknown as ImportedRecipe[];
};

export const fetchImportedRecipesWithTotal = async (filters: ImportedRecipeFilters = {}): Promise<ImportedRecipesResult> => {
  // Build base query for counting
  let countQuery = supabase
    .from('imported_recipes' as any)
    .select('*', { count: 'exact', head: true });

  // Build base query for data
  let dataQuery = supabase
    .from('imported_recipes' as any)
    .select('*');

  // Apply filters to both queries
  const applyFilters = (query: any) => {
    if (filters.keyword) {
      query = query.or(`title.ilike.%${filters.keyword}%,description.ilike.%${filters.keyword}%`);
    }

    if (filters.mealTypes && filters.mealTypes.length > 0) {
      query = query.overlaps('meal_types', filters.mealTypes);
    }

    if (filters.cuisineTypes && filters.cuisineTypes.length > 0) {
      query = query.in('cuisine_region', filters.cuisineTypes);
    }

    if (filters.dietLifestyle && filters.dietLifestyle.length > 0) {
      query = query.overlaps('diet_lifestyle', filters.dietLifestyle);
    }

    if (filters.cookingDurations && filters.cookingDurations.length > 0) {
      const timeConditions: string[] = [];
      filters.cookingDurations.forEach(duration => {
        switch (duration) {
          case '0-30':
            timeConditions.push('(prep_time + cook_time) <= 30');
            break;
          case '30-60':
            timeConditions.push('(prep_time + cook_time) > 30 AND (prep_time + cook_time) <= 60');
            break;
          case '60+':
            timeConditions.push('(prep_time + cook_time) > 60');
            break;
        }
      });
      if (timeConditions.length > 0) {
        query = query.or(timeConditions.join(','));
      }
    }

    return query;
  };

  countQuery = applyFilters(countQuery);
  dataQuery = applyFilters(dataQuery);

  // Apply pagination to data query only
  if (filters.offset) {
    dataQuery = dataQuery.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1);
  } else if (filters.limit) {
    dataQuery = dataQuery.limit(filters.limit);
  }

  // Order data query
  dataQuery = dataQuery.order('is_featured', { ascending: false })
                      .order('priority_score', { ascending: false })
                      .order('created_at', { ascending: false });

  // Execute both queries
  const [countResult, dataResult] = await Promise.all([
    countQuery,
    dataQuery
  ]);

  if (countResult.error) {
    console.error('Error fetching recipe count:', countResult.error);
    throw new Error(`Failed to fetch recipe count: ${countResult.error.message}`);
  }

  if (dataResult.error) {
    console.error('Error fetching imported recipes:', dataResult.error);
    throw new Error(`Failed to fetch imported recipes: ${dataResult.error.message}`);
  }

  return {
    recipes: (dataResult.data || []) as unknown as ImportedRecipe[],
    total: countResult.count || 0
  };
};

export const fetchImportedRecipeById = async (id: string): Promise<ImportedRecipe | null> => {
  const { data, error } = await supabase
    .from('imported_recipes' as any)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching imported recipe:', error);
    return null;
  }

  return data as unknown as ImportedRecipe | null;
};

export const incrementRecipeViewCount = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('imported_recipes' as any)
    .update({ view_count: (supabase as any).rpc('increment', { x: 1 }) })
    .eq('id', id);

  if (error) {
    console.error('Error incrementing view count:', error);
  }
};

export const incrementRecipeAddCount = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('imported_recipes' as any)
    .update({ add_count: (supabase as any).rpc('increment', { x: 1 }) })
    .eq('id', id);

  if (error) {
    console.error('Error incrementing add count:', error);
  }
};

// Admin management functions
export const deleteImportedRecipe = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('imported_recipes' as any)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting imported recipe:', error);
    throw new Error(`Failed to delete recipe: ${error.message}`);
  }
};

export const deleteAllImportedRecipes = async (): Promise<void> => {
  const { error } = await supabase
    .from('imported_recipes' as any)
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

  if (error) {
    console.error('Error deleting all imported recipes:', error);
    throw new Error(`Failed to delete all recipes: ${error.message}`);
  }
};

export const toggleImportedRecipeFeatured = async (id: string): Promise<boolean> => {
  // First get current status
  const { data: currentData, error: fetchError } = await supabase
    .from('imported_recipes' as any)
    .select('is_featured')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Error fetching recipe status:', fetchError);
    throw new Error(`Failed to fetch recipe status: ${fetchError.message}`);
  }

  if (!currentData) {
    throw new Error('Recipe not found');
  }

  const newFeaturedStatus = !(currentData as any).is_featured;

  const { error } = await supabase
    .from('imported_recipes' as any)
    .update({ is_featured: newFeaturedStatus })
    .eq('id', id);

  if (error) {
    console.error('Error toggling featured status:', error);
    throw new Error(`Failed to update featured status: ${error.message}`);
  }

  return newFeaturedStatus;
};

export const bulkDeleteImportedRecipes = async (ids: string[]): Promise<void> => {
  const { error } = await supabase
    .from('imported_recipes' as any)
    .delete()
    .in('id', ids);

  if (error) {
    console.error('Error bulk deleting recipes:', error);
    throw new Error(`Failed to delete recipes: ${error.message}`);
  }
};

export const bulkToggleFeatured = async (ids: string[], featured: boolean): Promise<void> => {
  const { error } = await supabase
    .from('imported_recipes' as any)
    .update({ is_featured: featured })
    .in('id', ids);

  if (error) {
    console.error('Error bulk updating featured status:', error);
    throw new Error(`Failed to update featured status: ${error.message}`);
  }
};

export const checkExistingRecipe = async (title: string): Promise<ImportedRecipe | null> => {
  const { data, error } = await supabase
    .from('imported_recipes' as any)
    .select('*')
    .eq('title', title)
    .maybeSingle();

  if (error) {
    console.error('Error checking existing recipe:', error);
    return null;
  }

  return data as unknown as ImportedRecipe | null;
};

export const updateImportedRecipe = async (id: string, updates: Partial<ImportedRecipe>): Promise<void> => {
  const { error } = await supabase
    .from('imported_recipes' as any)
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating imported recipe:', error);
    throw new Error(`Failed to update recipe: ${error.message}`);
  }
};

export const convertFiltersToImported = (filters: DiscoverRecipeFilters): ImportedRecipeFilters => {
  return {
    keyword: filters.keyword,
    mealTypes: filters.mealType ? [filters.mealType] : undefined,
    cuisineTypes: filters.cuisineType ? [filters.cuisineType] : undefined,
    cookingDurations: filters.time ? [filters.time] : undefined,
    dietLifestyle: filters.diet,
    limit: 20, // Default page size
    offset: 0
  };
};