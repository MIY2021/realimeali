
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types";

export function usePublicRecipeSharing() {
  const shareRecipePublicly = async (
    recipe: Recipe,
    shared_by_name: string,
    shared_by_household_name: string,
    expires_in_days: number = 30
  ) => {
    try {
      const expires_at = new Date();
      expires_at.setDate(expires_at.getDate() + expires_in_days);

      const { data, error } = await supabase
        .from('public_recipe_shares')
        .insert({
          public_share_id: crypto.randomUUID().slice(0, 12), // Generate a 12-char ID
          original_recipe_id: recipe.id,
          shared_by_user_id: recipe.created_by,
          shared_by_name,
          shared_by_household_name,
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          prep_time: recipe.prep_time,
          cook_time: recipe.cook_time,
          servings: recipe.servings,
          image: recipe.image,
          expires_at: expires_at.toISOString(),
          original_household_id: recipe.household_id
        })
        .select()
        .single();

      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Error sharing recipe publicly:', error);
      return { success: false, error };
    }
  };

  return {
    shareRecipePublicly
  };
}
