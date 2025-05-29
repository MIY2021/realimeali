
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types";

export function usePublicRecipeSharing() {
  const shareRecipePublicly = async (
    recipe: Recipe,
    sharedByName: string,
    sharedByHouseholdName: string,
    expiresInDays: number = 30
  ) => {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      const { data, error } = await supabase
        .from('public_recipe_shares')
        .insert({
          original_recipe_id: recipe.id,
          shared_by_user_id: recipe.createdBy,
          shared_by_name: sharedByName,
          shared_by_household_name: sharedByHouseholdName,
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          prep_time: recipe.prepTime,
          cook_time: recipe.cookTime,
          servings: recipe.servings,
          image: recipe.image,
          expires_at: expiresAt.toISOString(),
          original_household_id: recipe.householdId
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
