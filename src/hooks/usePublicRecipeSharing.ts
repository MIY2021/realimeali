
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const usePublicRecipeSharing = () => {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const shareRecipe = async (recipeId: string, recipeTitle: string) => {
    setIsSharing(true);
    try {
      const shareUrl = `${window.location.origin}/recipe/${recipeId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: recipeTitle,
          text: `Check out this recipe: ${recipeTitle}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied!",
          description: "Recipe link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      console.error("Error sharing recipe:", error);
      toast({
        title: "Error",
        description: "Failed to share recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  return {
    shareRecipe,
    isSharing
  };
};
