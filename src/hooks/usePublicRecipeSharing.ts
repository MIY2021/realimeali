
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

  const shareRecipe = async (recipe: Recipe, expirationDays: number = 30): Promise<string> => {
    if (!user || !currentHousehold) {
      toast({
        title: "Error",
        description: "You must be logged in to share recipes.",
        variant: "destructive",
      });
      return "";
    }

    setIsSharing(true);
    
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expirationDays);

      const { data, error } = await supabase
        .from('public_recipe_shares')
        .insert({
          recipe_id: recipe.id,
          shared_by: user.id,
          shared_by_name: user.email || "Unknown User",
          shared_by_household_name: currentHousehold.name,
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          prep_time: recipe.prepTime,
          cook_time: recipe.cookTime,
          servings: recipe.servings,
          image: recipe.image,
          expires_at: expiresAt.toISOString(),
          meal_type: recipe.mealType,
          cuisine_region: recipe.cuisineRegion,
          cooking_method: recipe.cookingMethod,
          complexity_level: recipe.complexityLevel,
          main_ingredient: recipe.mainIngredient,
          diet_lifestyle: recipe.dietLifestyle,
          original_recipe_id: recipe.id
        })
        .select('public_share_id')
        .single();

      if (error) throw error;

      const shareUrl = `${window.location.origin}/public/recipe/${data.public_share_id}`;
      
      toast({
        title: "Recipe Shared!",
        description: "Share link created successfully.",
      });

      return shareUrl;
    } catch (error) {
      console.error("Error sharing recipe:", error);
      toast({
        title: "Error",
        description: "Failed to share recipe. Please try again.",
        variant: "destructive",
      });
      return "";
    } finally {
      setIsSharing(false);
    }
  };

  return {
    shareRecipe,
    isSharing,
  };
}
