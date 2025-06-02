
import { useState } from 'react';
import { Recipe } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface AiRecipeGenerationProps {
  preferences?: string;
  dietaryRestrictions?: string;
  cookingTime?: number;
  servings?: number;
}

export function useAiRecipeGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecipe = async ({ 
    preferences = '', 
    dietaryRestrictions = '', 
    cookingTime = 30,
    servings = 4 
  }: AiRecipeGenerationProps): Promise<Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'> | null> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('parse-recipe-ai', {
        body: {
          prompt: `Generate a recipe with the following criteria:
            - Preferences: ${preferences || 'Any cuisine'}
            - Dietary restrictions: ${dietaryRestrictions || 'None'}
            - Cooking time: approximately ${cookingTime} minutes
            - Servings: ${servings}
            
            Please provide a complete recipe with title, description, ingredients list, step-by-step instructions, and estimated prep/cook times.`
        }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Failed to generate recipe');
      }

      if (!data?.recipe) {
        throw new Error('No recipe data received from AI');
      }

      const aiRecipe = data.recipe;

      // Transform the AI response to match our Recipe interface
      const recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'> = {
        title: aiRecipe.title || 'AI Generated Recipe',
        description: aiRecipe.description || '',
        ingredients: Array.isArray(aiRecipe.ingredients) ? aiRecipe.ingredients : [],
        instructions: Array.isArray(aiRecipe.instructions) ? aiRecipe.instructions : [],
        prep_time: aiRecipe.prep_time || 15,
        cook_time: aiRecipe.cook_time || cookingTime,
        servings: servings,
        household_id: '', // Will be set when saving
        is_favorite: false,
        meal_type: aiRecipe.meal_type || undefined,
        cuisine_region: aiRecipe.cuisine_region || undefined,
        diet_lifestyle: aiRecipe.diet_lifestyle || [],
        complexity_level: aiRecipe.complexity_level || 'quick_easy',
        main_ingredient: aiRecipe.main_ingredient || undefined,
        top_tip: aiRecipe.top_tip || undefined,
        image: aiRecipe.image || undefined,
        slug: aiRecipe.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || undefined
      };

      return recipe;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error generating AI recipe:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateRecipe,
    isGenerating,
    error
  };
}
