
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProgressTracking } from './useUrlRecipeProcessing/useProgressTracking';
import { normalizeCuisineRegion } from '@/utils/recipeClassification';

export function useAiRecipeGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [stylePreferences, setStylePreferences] = useState<string[]>([]);
  
  const progressTracking = useProgressTracking();

  const generateRecipe = async (options: { prompt?: string; stylePreferences?: string[] } = {}) => {
    const promptToUse = options.prompt || aiPrompt;
    const stylesToUse = options.stylePreferences || stylePreferences;
    
    if (!promptToUse.trim()) {
      toast.error('Please enter a recipe request');
      return null;
    }

    setIsGenerating(true);
    
    // Reset progress state before starting new generation
    progressTracking.resetProgress(true);
    
    // Start the progress animation identical to website import
    const progressInterval = progressTracking.startProgressAnimation();
    
    try {
      console.log('🤖 Generating recipe with AI:', promptToUse);
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: {
          generateRequest: promptToUse,
          stylePreferences: stylesToUse
        }
      });

      // Clear the progress animation
      clearInterval(progressInterval);

      if (error) {
        throw error;
      }

      if (!data?.parsedRecipe) {
        throw new Error('No recipe data received from AI');
      }

      const recipe = data.parsedRecipe;
      console.log('✅ Recipe generated successfully:', recipe.title);
      
      // Complete progress identical to website import
      progressTracking.completeProgress();
      
      toast.success('Recipe generated!', {
        description: `Created "${recipe.title}" with AI assistance`
      });

      // Reset progress after delay
      progressTracking.resetProgress();

      // Transform the AI response to match our Recipe interface (same as URL import)
      const transformedRecipe = {
        title: recipe.title || 'AI Generated Recipe',
        description: recipe.description || '',
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        ingredient_group_indices: Array.isArray(recipe.ingredientGroupIndices) ? recipe.ingredientGroupIndices : undefined,
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
        prep_time: recipe.prepTime || 0,
        cook_time: recipe.cookTime || 0,
        servings: recipe.servings || 1,
        top_tip: recipe.topTip || '',
        alcoholic_pairing: recipe.alcoholicPairing || null,
        non_alcoholic_pairing: recipe.nonAlcoholicPairing || null,
        // Convert mealType (string) to meal_types (array)
        meal_types: recipe.mealType ? [recipe.mealType] : [],
        // Don't auto-select cuisine - let user confirm/reject via autotag buttons
        cuisine_region: undefined,
        diet_lifestyle: Array.isArray(recipe.dietLifestyle) ? recipe.dietLifestyle : [],
        // Store suggested tags for confirmation (support multiple cuisines)
        suggestedTags: {
          meal_types: recipe.mealType ? [recipe.mealType] : [],
          cuisine_region: (() => {
            const cuisine = recipe.cuisineRegion;
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
          diet_lifestyle: Array.isArray(recipe.dietLifestyle) ? recipe.dietLifestyle : [],
        },
        image: undefined,
        is_favorite: false,
        has_cooked: false,
        household_id: '',
      };

      return transformedRecipe;

    } catch (error) {
      console.error('❌ Error generating recipe:', error);
      clearInterval(progressInterval);
      progressTracking.resetProgress(true);
      toast.error('Failed to generate recipe', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateRecipe,
    isGenerating,
    aiPrompt,
    setAiPrompt,
    stylePreferences,
    setStylePreferences,
    generationProgress: progressTracking.importProgress,
    progressValue: progressTracking.progressValue,
  };
}
