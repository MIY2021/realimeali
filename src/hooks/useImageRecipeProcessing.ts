
import { useState } from 'react';
import { Recipe } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export function useImageRecipeProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processImage = async (imageFile: File): Promise<Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'> | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      // Convert image to base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      const { data, error: functionError } = await supabase.functions.invoke('parse-recipe-ai', {
        body: {
          image: base64Image,
          mimeType: imageFile.type
        }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Failed to process image');
      }

      if (!data?.recipe) {
        throw new Error('No recipe data extracted from image');
      }

      const extractedRecipe = data.recipe;

      // Transform the extracted data to match our Recipe interface
      const recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'> = {
        title: extractedRecipe.title || 'Recipe from Image',
        description: extractedRecipe.description || '',
        ingredients: Array.isArray(extractedRecipe.ingredients) ? extractedRecipe.ingredients : [],
        instructions: Array.isArray(extractedRecipe.instructions) ? extractedRecipe.instructions : [],
        prep_time: extractedRecipe.prep_time || 15,
        cook_time: extractedRecipe.cook_time || 30,
        servings: extractedRecipe.servings || 4,
        household_id: '', // Will be set when saving
        is_favorite: false,
        meal_type: extractedRecipe.meal_type || undefined,
        cuisine_region: extractedRecipe.cuisine_region || undefined,
        diet_lifestyle: extractedRecipe.diet_lifestyle || [],
        complexity_level: extractedRecipe.complexity_level || 'quick_easy',
        main_ingredient: extractedRecipe.main_ingredient || undefined,
        top_tip: extractedRecipe.top_tip || undefined,
        image: undefined, // Don't include the original image
        slug: extractedRecipe.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || undefined
      };

      return recipe;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error processing image:', err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processImage,
    isProcessing,
    error
  };
}
