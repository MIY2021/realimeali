
import { useState } from 'react';
import { Recipe } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PROGRESS_MESSAGES = [
  "📸 Reading your recipe photo...",
  "🔍 Analyzing text in the image...",
  "📝 Extracting recipe details...",
  "⚙️ Organizing ingredients and steps...",
  "🎯 Finalizing recipe information...",
  "✨ Almost ready to cook!"
];

export function useImageRecipeProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState("");
  const [progressValue, setProgressValue] = useState(0);

  const startProgressAnimation = () => {
    setProgressValue(0);
    let currentProgress = 0;
    let messageIndex = 0;
    
    const progressInterval = setInterval(() => {
      // Update progress smoothly
      currentProgress = Math.min(currentProgress + Math.random() * 15 + 5, 85);
      setProgressValue(currentProgress);
      
      // Update progress messages
      if (messageIndex < PROGRESS_MESSAGES.length) {
        setImportProgress(PROGRESS_MESSAGES[messageIndex]);
        messageIndex++;
      }
    }, 1000);
    
    return progressInterval;
  };

  const completeProgress = () => {
    setProgressValue(100);
    setImportProgress("✅ Recipe imported successfully!");
  };

  const resetProgress = () => {
    setTimeout(() => {
      setImportProgress("");
      setProgressValue(0);
    }, 2000);
  };

  const processImage = async (imageFile: File): Promise<Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'> | null> => {
    setIsProcessing(true);
    setError(null);
    
    // Start progress animation
    const progressInterval = startProgressAnimation();

    try {
      console.log('🖼️ Starting image processing:', imageFile.name);
      
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

      console.log('📸 Image converted to base64, calling AI service...');

      const { data, error: functionError } = await supabase.functions.invoke('parse-recipe-ai', {
        body: {
          image: base64Image,
          mimeType: imageFile.type
        }
      });

      // Clear progress interval
      clearInterval(progressInterval);

      if (functionError) {
        console.error('❌ Function error:', functionError);
        throw new Error(functionError.message || 'Failed to process image');
      }

      if (!data?.recipe) {
        console.error('❌ No recipe data in response:', data);
        throw new Error('No recipe data extracted from image');
      }

      const extractedRecipe = data.recipe;
      console.log('✅ Recipe extracted successfully:', extractedRecipe.title);

      // Complete progress
      completeProgress();

      // Show success toast
      toast.success('Recipe imported from image!', {
        description: `Successfully extracted "${extractedRecipe.title}"`
      });

      // Transform the extracted data to match our Recipe interface
      const recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'> = {
        title: extractedRecipe.title || 'Recipe from Image',
        description: extractedRecipe.description || '',
        ingredients: Array.isArray(extractedRecipe.ingredients) ? extractedRecipe.ingredients : [],
        instructions: Array.isArray(extractedRecipe.instructions) ? extractedRecipe.instructions : [],
        prep_time: extractedRecipe.prepTime || 15,
        cook_time: extractedRecipe.cookTime || 30,
        servings: extractedRecipe.servings || 4,
        household_id: '', // Will be set when saving
        is_favorite: false,
        has_cooked: false,
        meal_type: extractedRecipe.mealType || undefined,
        cuisine_region: extractedRecipe.cuisineRegion || undefined,
        diet_lifestyle: extractedRecipe.dietLifestyle || [],
        complexity_level: extractedRecipe.complexityLevel || 'quick_easy',
        main_ingredient: extractedRecipe.mainIngredient || undefined,
        top_tip: extractedRecipe.topTip || undefined,
        image: undefined, // Don't include the original image
        slug: extractedRecipe.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || undefined
      };

      // Reset progress after delay
      resetProgress();

      return recipe;

    } catch (err) {
      // Clear progress interval on error
      clearInterval(progressInterval);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setImportProgress("");
      setProgressValue(0);
      
      console.error('❌ Error processing image:', err);
      
      toast.error('Failed to import recipe from image', {
        description: errorMessage
      });
      
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processImage,
    isProcessing,
    error,
    importProgress,
    progressValue
  };
}
