
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useCommunityRecipe() {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const shareRecipe = async (recipeId: string, notes: string = '') => {
    setIsSharing(true);
    try {
      // First get the recipe data to create the community recipe
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (recipeError || !recipe) {
        throw new Error('Recipe not found');
      }

      // Create community recipe entry
      const { error } = await supabase
        .from('community_recipes')
        .insert({
          title: recipe.title,
          description: recipe.description || notes.trim() || null,
          source_url: `recipe/${recipeId}`,
          submitted_by: recipe.user_id,
          prep_time: recipe.prep_time,
          cook_time: recipe.cook_time,
          servings: recipe.servings,
          image_url: recipe.image,
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Recipe shared!",
        description: "Your recipe has been shared with the community.",
      });

      return true;
    } catch (error: any) {
      console.error('Error sharing recipe:', error);
      toast({
        title: "Error sharing recipe",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSharing(false);
    }
  };

  return {
    shareRecipe,
    isSharing,
  };
}
