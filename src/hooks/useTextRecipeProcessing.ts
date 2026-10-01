import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export function useTextRecipeProcessing() {
  const { toast } = useToast();
  const [recipeText, setRecipeText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcessText = async (
    setNewRecipe: (recipe: Omit<Recipe, "id" | "created_at" | "updated_at" | "created_by">) => void,
    currentRecipe: Omit<Recipe, "id" | "created_at" | "updated_at" | "created_by">,
    setActiveTab: (tab: string) => void
  ) => {
    const sourceText = recipeText.trim();

    if (!sourceText) {
      toast({
        title: "Recipe text required",
        description: "Paste a recipe into the box first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log("Starting dedicated recipe text import:", {
        characters: sourceText.length,
        lines: sourceText.split(/\r?\n/).length,
      });

      const { data, error } = await supabase.functions.invoke("parse-recipe-text", {
        body: { recipeText: sourceText },
      });

      if (error) {
        console.error("Recipe text import failed:", error);
        throw new Error(error.message || "Failed to process recipe text.");
      }

      const recipeData = data?.parsedRecipe;

      if (!recipeData) {
        throw new Error("The recipe importer returned no recipe.");
      }

      if (!Array.isArray(recipeData.ingredients) || recipeData.ingredients.length === 0) {
        throw new Error("The recipe importer returned no ingredients.");
      }

      if (!Array.isArray(recipeData.instructions) || recipeData.instructions.length === 0) {
        throw new Error("The recipe importer returned no cooking instructions.");
      }

      const transformedRecipe = {
        ...currentRecipe,
        title: recipeData.title,
        description: recipeData.description || "",
        ingredients: recipeData.ingredients,
        ingredient_group_indices: Array.isArray(recipeData.ingredientGroupIndices)
          ? recipeData.ingredientGroupIndices
          : undefined,
        instructions: recipeData.instructions,
        prep_time: Number.isFinite(recipeData.prepTime) ? recipeData.prepTime : 0,
        cook_time: Number.isFinite(recipeData.cookTime) ? recipeData.cookTime : 0,
        servings: Number.isFinite(recipeData.servings) ? recipeData.servings : 4,
        top_tip: recipeData.topTip || "",
        alcoholic_pairing: recipeData.alcoholicPairing || null,
        non_alcoholic_pairing: recipeData.nonAlcoholicPairing || null,
        meal_types: recipeData.mealType ? [recipeData.mealType] : [],
        cuisine_region: recipeData.cuisineRegion || undefined,
        diet_lifestyle: Array.isArray(recipeData.dietLifestyle)
          ? recipeData.dietLifestyle
          : [],
        household_id: currentRecipe.household_id,
        is_favorite: currentRecipe.is_favorite,
        has_cooked: currentRecipe.has_cooked,
        image: undefined,
      };

      setNewRecipe(transformedRecipe);
      setActiveTab("manual");
      setRecipeText("");

      toast({
        title: "Recipe imported! 🎉",
        description: "The recipe has been extracted and is ready to review.",
      });
    } catch (error) {
      console.error("Error processing recipe text:", error);

      const message = error instanceof Error
        ? error.message
        : "Failed to process recipe text. Please try again.";

      toast({
        title: "Recipe import failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    recipeText,
    setRecipeText,
    isProcessing,
    handleProcessText,
  };
}
