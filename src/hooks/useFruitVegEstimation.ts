import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Recipe } from '@/types';

export interface EstimationResult {
  portions: number;
  breakdown?: string;
  totalGrams?: number;
  cached: boolean;
}

export const useFruitVegEstimation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estimatePortions = useCallback(async (recipe: Recipe): Promise<number | null> => {
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      return null;
    }

    // If we already have the estimation, return it
    if (recipe.fruit_veg_portions !== null && recipe.fruit_veg_portions !== undefined) {
      return recipe.fruit_veg_portions;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('estimate-fruit-veg-portions', {
        body: {
          recipeId: recipe.id,
          ingredients: recipe.ingredients,
          servings: recipe.servings || 1
        }
      });

      if (functionError) throw functionError;

      const result: EstimationResult = data;
      return result.portions;
    } catch (err) {
      console.error('Error estimating fruit/veg portions:', err);
      setError(err instanceof Error ? err.message : 'Failed to estimate portions');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    estimatePortions,
    isLoading,
    error
  };
};