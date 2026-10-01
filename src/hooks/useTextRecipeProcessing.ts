
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { normalizeCuisineRegion } from "@/utils/recipeClassification";

export function useTextRecipeProcessing() {
  const { toast } = useToast();
  const [recipeText, setRecipeText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcessText = async (
    setNewRecipe: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void,
    currentRecipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>,
    setActiveTab: (tab: string) => void
  ) => {
    if (!recipeText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some recipe text to process",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Processing Timeout",
        description: "Text processing is taking too long. Please try again with shorter text or check your connection.",
        variant: "destructive",
      });
    }, 60000); // 60 second timeout

    try {
      console.log('Processing recipe text:', recipeText.substring(0, 100) + '...');
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { 
          recipeText: recipeText.trim(),
          preserveQuantities: true // Add flag to preserve quantities
        }
      });

      clearTimeout(timeoutId); // Clear timeout on success

      if (error) {
        console.error('Error calling parse-recipe-ai function:', error);
        throw new Error(error.message || 'Failed to process recipe text');
      }

      if (!data?.parsedRecipe) {
        throw new Error('No recipe data could be extracted from the text');
      }

      console.log('Received processed recipe:', data.parsedRecipe);
      
      const recipeData = data.parsedRecipe;
      
      // Transform the data to match our Recipe interface (same as URL import)
      const transformedRecipe = {
        ...currentRecipe,
        title: recipeData.title || "",
        description: recipeData.description || "",
        ingredients: Array.isArray(recipeData.ingredients) ? recipeData.ingredients : [],
        ingredient_group_indices: Array.isArray(recipeData.ingredientGroupIndices) ? recipeData.ingredientGroupIndices : undefined,
        instructions: Array.isArray(recipeData.instructions) ? recipeData.instructions : [],
        prep_time: recipeData.prepTime || 0,
        cook_time: recipeData.cookTime || 0,
        servings: recipeData.servings || 1,
        top_tip: recipeData.topTip || "",
        alcoholic_pairing: recipeData.alcoholicPairing || null,
        non_alcoholic_pairing: recipeData.nonAlcoholicPairing || null,
        // Classification is returned by the Edge Function in both flattened
        // fields (for backwards compatibility) and a nested classification object.
        // Accept both shapes so imported recipes actually populate the form.
        meal_types: recipeData.mealType
          ? [recipeData.mealType]
          : recipeData.classification?.mealType
            ? [recipeData.classification.mealType]
            : (currentRecipe.meal_types || []),
        cuisine_region: (() => {
          const cuisine = recipeData.cuisineRegion ?? recipeData.classification?.cuisineRegion;
          if (Array.isArray(cuisine)) return cuisine.map(normalizeCuisineRegion).filter(Boolean)[0] || currentRecipe.cuisine_region;
          return cuisine ? normalizeCuisineRegion(cuisine) || currentRecipe.cuisine_region : currentRecipe.cuisine_region;
        })(),
        diet_lifestyle: Array.isArray(recipeData.dietLifestyle)
          ? recipeData.dietLifestyle
          : (Array.isArray(recipeData.classification?.dietLifestyle)
            ? recipeData.classification.dietLifestyle
            : (currentRecipe.diet_lifestyle || [])),
        // Store suggested tags for confirmation (support multiple cuisines)
        suggestedTags: {
          meal_types: recipeData.mealType ? [recipeData.mealType] : [],
          cuisine_region: (() => {
            const cuisine = recipeData.cuisineRegion ?? recipeData.classification?.cuisineRegion;
            if (Array.isArray(cuisine)) {
              // Normalize all cuisine suggestions
              const normalized = cuisine.map(c => normalizeCuisineRegion(c)).filter(Boolean);
              console.log('✅ Storing cuisine suggestions (array):', normalized);
              return normalized;
            }
            if (cuisine) {
              // Normalize single cuisine suggestion
              const normalized = normalizeCuisineRegion(cuisine);
              if (normalized) {
                console.log('✅ Storing cuisine suggestion (single):', normalized, '(normalized from:', cuisine, ')');
                return [normalized];
              }
            }
            console.warn('⚠️ No cuisine suggestion from AI');
            return [];
          })(),
          diet_lifestyle: Array.isArray(recipeData.dietLifestyle) ? recipeData.dietLifestyle : [],
        },
        household_id: currentRecipe.household_id,
        is_favorite: currentRecipe.is_favorite,
        has_cooked: currentRecipe.has_cooked,
        image: undefined, // Start with no image so user can select
      };
      
      setNewRecipe(transformedRecipe);
      setActiveTab("manual");
      
      toast({
        title: "Recipe Processed! 🎉",
        description: "Your recipe has been organized and categorized automatically with quantities preserved.",
      });

      // Clear the text input on success
      setRecipeText("");
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error processing recipe text:', error);
      
      let errorMessage = "Failed to process recipe text. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('network')) {
          errorMessage = "Connection timeout. Please check your internet and try again.";
        } else if (error.message.includes('rate limit')) {
          errorMessage = "Too many requests. Please wait a moment before trying again.";
        }
      }
      
      toast({
        title: "Processing Failed",
        description: errorMessage,
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
