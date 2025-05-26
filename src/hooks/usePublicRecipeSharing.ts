
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Recipe } from "@/types";

export interface PublicRecipeShare {
  id: string;
  public_share_id: string;
  original_recipe_id: string;
  original_household_id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  categories: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  image?: string;
  shared_by_user_id: string;
  shared_by_name?: string;
  shared_by_household_name?: string;
  view_count: number;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
}

export const usePublicRecipeSharing = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { profile } = useUserProfile(user?.id);
  const [isCreatingShare, setIsCreatingShare] = useState(false);
  const [isSavingRecipe, setIsSavingRecipe] = useState(false);

  const createPublicShare = async (recipe: Recipe): Promise<string | null> => {
    if (!user || !currentHousehold || !profile) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to share recipes.",
        variant: "destructive",
      });
      return null;
    }

    setIsCreatingShare(true);
    try {
      // Generate a unique public share ID
      const { data: shareIdData } = await supabase.rpc('generate_public_share_id');
      const publicShareId = shareIdData;

      // Create the public share
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
          categories: recipe.categories,
          prep_time: recipe.prepTime,
          cook_time: recipe.cookTime,
          servings: recipe.servings,
          image: recipe.image,
          shared_by_user_id: user.id,
          shared_by_name: profile.full_name,
          shared_by_household_name: currentHousehold.name,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating public share:", error);
        throw error;
      }

      const shareUrl = `${window.location.origin}/share/recipes/${publicShareId}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: "Recipe Shared Successfully!",
        description: "The public recipe link has been copied to your clipboard.",
      });

      return shareUrl;
    } catch (error) {
      console.error("Error creating public share:", error);
      toast({
        title: "Sharing Failed",
        description: "Failed to create public recipe share. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsCreatingShare(false);
    }
  };

  const getPublicShare = async (publicShareId: string): Promise<PublicRecipeShare | null> => {
    try {
      // Increment view count
      await supabase.rpc('increment_share_view_count', { share_id: publicShareId });

      // Fetch the public share
      const { data, error } = await supabase
        .from('public_recipe_shares')
        .select('*')
        .eq('public_share_id', publicShareId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error("Error fetching public share:", error);
        return null;
      }

      return data as PublicRecipeShare;
    } catch (error) {
      console.error("Error getting public share:", error);
      return null;
    }
  };

  const saveToMyRecipes = async (publicShare: PublicRecipeShare): Promise<boolean> => {
    if (!user || !currentHousehold) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to save recipes.",
        variant: "destructive",
      });
      return false;
    }

    setIsSavingRecipe(true);
    try {
      const { error } = await supabase
        .from('recipes')
        .insert({
          title: publicShare.title,
          description: publicShare.description,
          ingredients: publicShare.ingredients,
          instructions: publicShare.instructions,
          categories: publicShare.categories,
          prep_time: publicShare.prep_time,
          cook_time: publicShare.cook_time,
          servings: publicShare.servings,
          image: publicShare.image,
          user_id: user.id,
          household_id: currentHousehold.id,
          is_favorite: false,
        });

      if (error) {
        console.error("Error saving recipe:", error);
        throw error;
      }

      toast({
        title: "Recipe Saved!",
        description: `"${publicShare.title}" has been saved to your recipes.`,
      });

      return true;
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save recipe to your collection. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSavingRecipe(false);
    }
  };

  return {
    createPublicShare,
    getPublicShare,
    saveToMyRecipes,
    isCreatingShare,
    isSavingRecipe,
  };
};
