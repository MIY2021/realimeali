
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAiRecipeGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [stylePreferences, setStylePreferences] = useState<string[]>([]);

  const generateRecipe = async (options: { prompt?: string; stylePreferences?: string[] } = {}) => {
    const promptToUse = options.prompt || aiPrompt;
    const stylesToUse = options.stylePreferences || stylePreferences;
    
    if (!promptToUse.trim()) {
      toast.error('Please enter a recipe request');
      return null;
    }

    setIsGenerating(true);
    
    try {
      console.log('🤖 Generating recipe with AI:', promptToUse);
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: {
          generateRequest: promptToUse,
          stylePreferences: stylesToUse
        }
      });

      if (error) {
        throw error;
      }

      if (!data?.parsedRecipe) {
        throw new Error('No recipe data received from AI');
      }

      const recipe = data.parsedRecipe;
      console.log('✅ Recipe generated successfully:', recipe.title);
      
      toast.success('Recipe generated!', {
        description: `Created "${recipe.title}" with AI assistance`
      });

      // Transform the AI response to match our Recipe interface
      return {
        title: recipe.title || 'AI Generated Recipe',
        description: recipe.description || '',
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        prep_time: recipe.prepTime || 15,
        cook_time: recipe.cookTime || 30,
        servings: recipe.servings || 4,
        top_tip: recipe.topTip || 'Enjoy your AI-generated recipe!',
        meal_type: recipe.mealType,
        cuisine_region: recipe.cuisineRegion,
        diet_lifestyle: recipe.dietLifestyle || [],
        complexity_level: recipe.complexityLevel,
        main_ingredient: recipe.mainIngredient,
        image: undefined,
        is_favorite: false,
        has_cooked: false,
        household_id: '',
      };

    } catch (error) {
      console.error('❌ Error generating recipe:', error);
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
  };
}
