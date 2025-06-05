
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useCommunityRecipe } from "@/hooks/useCommunityRecipe";
import { sanitizeRecipeData } from "@/utils/contentSanitizer";
import { Recipe } from "@/types";

export function useRecipeSubmissionHandler() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentHousehold } = useHousehold();
  const { shareRecipe } = useCommunityRecipe();

  const handleSubmit = async (
    e: React.FormEvent,
    newRecipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>,
    shareWithCommunity: boolean,
    setShowCommunityDialog: (show: boolean) => void
  ) => {
    e.preventDefault();

    if (!currentHousehold?.id) {
      toast({
        title: "No Household",
        description: "Please create or join a household to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!newRecipe.title.trim() || !newRecipe.ingredients.length || !newRecipe.instructions.length) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Sanitize the recipe data
    const sanitizedRecipe = sanitizeRecipeData(newRecipe);

    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...sanitizedRecipe,
          household_id: currentHousehold.id,
          share_with_community: shareWithCommunity
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (shareWithCommunity) {
          setShowCommunityDialog(true);
        } else {
          toast({
            title: "Recipe created!",
            description: `"${newRecipe.title}" has been added to your collection.`,
          });
          navigate(`/recipe/${data.id}`);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Failed to create recipe');
      }
    } catch (error: any) {
      console.error("Error creating recipe:", error);
      toast({
        title: "Error creating recipe",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShareRecipe = useCallback(async (recipeId: string, notes: string, recipeTitle: string) => {
    try {
      await shareRecipe(recipeId, notes);
      toast({
        title: "Recipe shared!",
        description: `"${recipeTitle}" has been shared with the community.`,
      });
      navigate(`/recipe/${recipeId}`);
    } catch (error: any) {
      console.error("Error sharing recipe:", error);
      toast({
        title: "Error sharing recipe",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  }, [navigate, shareRecipe, toast]);

  return {
    handleSubmit,
    handleShareRecipe,
  };
}
