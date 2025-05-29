
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CommunityRecipe {
  id: string;
  title: string;
  description: string | null;
  source_url: string;
  image_url: string | null;
  image_credit: string | null;
  prep_time: number;
  cook_time: number;
  servings: number;
  cuisine: string | null;
  category: string | null;
  difficulty_level: string | null;
  submitted_by: string;
  submitted_by_name: string | null;
  view_count: number;
  save_count: number;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
}

export function useCommunityRecipes() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<CommunityRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCommunityRecipes = useCallback(async (filters?: {
    category?: string;
    cuisine?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    if (!user) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from('community_recipes')
        .select('*', { count: 'exact' })
        .eq('is_approved', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.cuisine && filters.cuisine !== 'all') {
        query = query.eq('cuisine', filters.cuisine);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setRecipes(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching community recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load community recipes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const submitCommunityRecipe = useCallback(async (recipeData: {
    title: string;
    description?: string;
    source_url: string;
    image_url?: string;
    image_credit?: string;
    prep_time?: number;
    cook_time?: number;
    servings?: number;
    cuisine?: string;
    category?: string;
    difficulty_level?: string;
  }) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to submit recipes",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('community_recipes')
        .insert({
          ...recipeData,
          submitted_by: user.id,
          submitted_by_name: user.email || 'Anonymous',
        });

      if (error) throw error;

      toast({
        title: "Recipe Submitted!",
        description: "Your recipe has been submitted for review and will appear in the community once approved.",
      });

      return true;
    } catch (error) {
      console.error('Error submitting community recipe:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit recipe to community",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  const incrementViewCount = useCallback(async (recipeId: string) => {
    try {
      await supabase.rpc('increment_community_recipe_view_count', {
        recipe_id: recipeId
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }, []);

  const incrementSaveCount = useCallback(async (recipeId: string) => {
    try {
      await supabase.rpc('increment_community_recipe_save_count', {
        recipe_id: recipeId
      });
    } catch (error) {
      console.error('Error incrementing save count:', error);
    }
  }, []);

  return {
    recipes,
    isLoading,
    totalCount,
    fetchCommunityRecipes,
    submitCommunityRecipe,
    incrementViewCount,
    incrementSaveCount,
  };
}
