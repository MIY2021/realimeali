
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useCommunityRecipe() {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const shareRecipe = async (recipeId: string, notes: string = '') => {
    setIsSharing(true);
    try {
      const { error } = await supabase
        .from('community_recipes')
        .insert({
          recipe_id: recipeId,
          notes: notes.trim() || null,
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
