
import { useState } from "react";
import { Recipe } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function usePublicRecipeSharing() {
  const [isSharing, setIsSharing] = useState(false);
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { toast } = useToast();

  const shareRecipe = async (recipe: Recipe, expirationDays?: number) => {
    if (!user || !currentHousehold) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to share recipes.",
        variant: "destructive"
      });
      return null;
    }

    if (recipe.createdBy !== user.id && recipe.householdId !== currentHousehold.id) {
      toast({
        title: "Permission Denied",
        description: "You can only share recipes from your household.",
        variant: "destructive"
      });
      return null;
    }

    setIsSharing(true);
    try {
      const publicShareId = generateShareId();
      const expiresAt = expirationDays 
        ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const slug = recipe.title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const { data, error } = await supabase
        .from('public_recipe_shares')
        .insert({
          public_share_id: publicShareId,
          original_recipe_id: recipe.id,
          original_household_id: recipe.householdId,
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          prep_time: recipe.prepTime,
          cook_time: recipe.cookTime,
          servings: recipe.servings,
          image: recipe.image,
          shared_by_user_id: user.id,
          shared_by_name: user.email, // Use email as fallback for name
          shared_by_household_name: currentHousehold.name,
          expires_at: expiresAt,
          slug: slug
        })
        .select()
        .single();

      if (error) {
        console.error('Error sharing recipe:', error);
        toast({
          title: "Sharing Failed",
          description: "Failed to share recipe. Please try again.",
          variant: "destructive"
        });
        return null;
      }

      const shareUrl = `${window.location.origin}/shared/${publicShareId}`;
      
      toast({
        title: "Recipe Shared!",
        description: "Share link copied to clipboard.",
      });

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      return shareUrl;
    } catch (error) {
      console.error('Error sharing recipe:', error);
      toast({
        title: "Sharing Failed",
        description: "Failed to share recipe. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsSharing(false);
    }
  };

  const generateShareId = (): string => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  return {
    shareRecipe,
    isSharing
  };
}
