
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Recipe, RecipeCategory } from "@/types";
import { generateSlug, ensureUniqueSlug } from "@/utils/slugUtils";

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
  slug: string | null;
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

      // Generate URL-friendly slug from recipe title
      const baseSlug = generateSlug(recipe.title);

      // Check for existing slugs to ensure uniqueness
      const { data: existingSlugs } = await supabase
        .from('public_recipe_shares')
        .select('slug')
        .not('slug', 'is', null);

      const slugList = existingSlugs?.map(item => item.slug) || [];
      const uniqueSlug = ensureUniqueSlug(baseSlug, slugList);

      // Create the public share
      const { data, error } = await supabase
        .from('public_recipe_shares')
        .insert({
          public_share_id: publicShareId,
          slug: uniqueSlug,
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

      // Use the clean URL format with the slug and /share suffix
      const shareUrl = `https://realimeali.com/recipe/${uniqueSlug}/share`;
      
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

  const getPublicShare = async (slugOrId: string): Promise<PublicRecipeShare | null> => {
    try {
      // Try to fetch by slug first
      let { data, error } = await supabase
        .from('public_recipe_shares')
        .select('*')
        .eq('slug', slugOrId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        // Fallback: try to fetch by public_share_id for backward compatibility
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('public_recipe_shares')
          .select('*')
          .eq('public_share_id', slugOrId)
          .eq('is_active', true)
          .single();

        if (fallbackError || !fallbackData) {
          console.error("Error fetching public share:", error, fallbackError);
          return null;
        }
        
        data = fallbackData;
      }

      return data as PublicRecipeShare;
    } catch (error) {
      console.error("Error getting public share:", error);
      return null;
    }
  };

  const trackView = async (slugOrId: string): Promise<void> => {
    // Check if we've already tracked a view for this recipe in this session
    const viewKey = `recipe_view_${slugOrId}`;
    const hasViewed = sessionStorage.getItem(viewKey);
    
    if (hasViewed) {
      return; // Already tracked view in this session
    }

    try {
      // Try to increment view count by slug first
      const { data: recipe } = await supabase
        .from('public_recipe_shares')
        .select('public_share_id')
        .or(`slug.eq.${slugOrId},public_share_id.eq.${slugOrId}`)
        .eq('is_active', true)
        .single();

      if (recipe) {
        // Increment view count using the public_share_id
        await supabase.rpc('increment_share_view_count', { share_id: recipe.public_share_id });
        
        // Mark as viewed in this session
        sessionStorage.setItem(viewKey, 'true');
      }
    } catch (error) {
      console.error("Error tracking view:", error);
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
      // Type assertion to ensure categories are properly typed
      const typedCategories = publicShare.categories as RecipeCategory[];
      
      const { error } = await supabase
        .from('recipes')
        .insert({
          title: publicShare.title,
          description: publicShare.description,
          ingredients: publicShare.ingredients,
          instructions: publicShare.instructions,
          categories: typedCategories,
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
    trackView,
    saveToMyRecipes,
    isCreatingShare,
    isSavingRecipe,
  };
};
