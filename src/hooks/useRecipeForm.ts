
import { useState } from "react";
import { Recipe } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const useRecipeForm = () => {
  const [newRecipe, setNewRecipe] = useState<Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>>({
    title: "",
    description: "",
    ingredients: [],
    instructions: [],
    prep_time: 0,
    cook_time: 0,
    servings: 1,
    image: "",
    is_favorite: false,
    has_cooked: false,
    top_tip: "",
    household_id: "",
    meal_type: undefined,
    cuisine_region: undefined,
    diet_lifestyle: [],
    complexity_level: undefined,
    main_ingredient: undefined,
  });

  const [shareWithCommunity, setShareWithCommunity] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const resetForm = () => {
    setNewRecipe({
      title: "",
      description: "",
      ingredients: [],
      instructions: [],
      prep_time: 0,
      cook_time: 0,
      servings: 1,
      image: "",
      is_favorite: false,
      has_cooked: false,
      top_tip: "",
      household_id: "",
      meal_type: undefined,
      cuisine_region: undefined,
      diet_lifestyle: [],
      complexity_level: undefined,
      main_ingredient: undefined,
    });
    setShareWithCommunity(false);
    setImagePreview("");
    setIsGeneratingImage(false);
    setGenerationProgress(0);
  };

  return {
    newRecipe,
    setNewRecipe,
    shareWithCommunity,
    setShareWithCommunity,
    imagePreview,
    setImagePreview,
    isGeneratingImage,
    setIsGeneratingImage,
    generationProgress,
    setGenerationProgress,
    resetForm,
    supabase,
  };
};
