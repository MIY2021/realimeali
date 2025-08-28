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

  return data || [];
};

export const fetchImportedRecipeById = async (id: string): Promise<ImportedRecipe | null> => {
  const { data, error } = await supabase
    .from('imported_recipes' as any)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching imported recipe:', error);
    return null;
  }

  return data;
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