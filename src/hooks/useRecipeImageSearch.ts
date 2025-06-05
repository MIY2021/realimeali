
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useRecipeImageSearch() {
  const [isSearchingImages, setIsSearchingImages] = useState(false);
  const [searchedImages, setSearchedImages] = useState<string[]>([]);

  const searchRecipeImages = async (recipeTitle: string): Promise<string[]> => {
    if (!recipeTitle.trim()) {
      toast.error('Recipe title is required to search for images');
      return [];
    }

    setIsSearchingImages(true);
    
    try {
      console.log('🔍 Searching for images for recipe:', recipeTitle);
      
      const { data, error } = await supabase.functions.invoke('search-recipe-images', {
        body: { recipeTitle: recipeTitle.trim() }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to search for images');
      }

      const images = data.images || [];
      setSearchedImages(images);

      if (images.length === 0) {
        toast.info('No images found for this recipe', {
          description: 'Try adding more descriptive words to your recipe title'
        });
      } else {
        toast.success(`Found ${images.length} images!`, {
          description: 'Select your favorite to use for this recipe'
        });
      }

      console.log('✅ Found images:', images);
      return images;

    } catch (error) {
      console.error('❌ Error searching for images:', error);
      
      if (error.message?.includes('Google API credentials not configured')) {
        toast.error('Image search not available', {
          description: 'Google API credentials need to be configured'
        });
      } else {
        toast.error('Failed to search for images', {
          description: error.message || 'Please try again'
        });
      }
      
      return [];
    } finally {
      setIsSearchingImages(false);
    }
  };

  const clearSearchedImages = () => {
    setSearchedImages([]);
  };

  return {
    searchRecipeImages,
    clearSearchedImages,
    isSearchingImages,
    searchedImages,
  };
}
