
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Recipe } from '@/types';
import { useRecipeApi } from '@/hooks/useRecipeApi';
import { toast } from 'sonner';
import { useHousehold } from '@/contexts/HouseholdContext';

interface RecipesContextType {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  fetchRecipes: (householdId: string | null) => Promise<void>;
  fetchRecipeById: (id: string) => Promise<Recipe | null>;
  getRecipeById: (id: string) => Recipe | undefined;
  getRecipeBySlug: (slug: string) => Recipe | undefined;
  createRecipe: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>, householdId: string) => Promise<Recipe | null>;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => Promise<Recipe | null>;
  deleteRecipe: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string, isFavorite: boolean) => Promise<Recipe | null>;
  toggleCookingStatus: (id: string) => Promise<Recipe | null>;
  fetchDeletedRecipes: (householdId: string) => Promise<Recipe[]>;
  restoreRecipe: (id: string) => Promise<boolean>;
  permanentDeleteRecipe: (id: string) => Promise<boolean>;
}

const RecipesContext = createContext<RecipesContextType | undefined>(undefined);

export const RecipesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const { currentHousehold, isLoadingHousehold } = useHousehold();
  // Start with loading=true if we have a household but no recipes yet
  const [isLoading, setIsLoading] = useState(
    !isLoadingHousehold && currentHousehold !== null && recipes.length === 0
  );
  const [error, setError] = useState<string | null>(null);
  const api = useRecipeApi();
  
  // Performance: Track last fetched household to prevent duplicate fetches
  const lastFetchedHouseholdIdRef = useRef<string | null>(null);

  // Auto-fetch disabled - now controlled by useParallelDataLoader for better performance
  // Clear recipes when household changes to null
  useEffect(() => {
    const householdId = currentHousehold?.id || null;
    
    // When household loads and we have no recipes, set loading to true
    if (householdId && recipes.length === 0 && !isLoadingHousehold) {
      setIsLoading(true);
    }
    
    if (!householdId && lastFetchedHouseholdIdRef.current) {
      console.log('RecipesContext: No household available, clearing recipes');
      lastFetchedHouseholdIdRef.current = null;
      setRecipes([]);
      setIsLoading(false);
    }
  }, [currentHousehold?.id, isLoadingHousehold, recipes.length]);

  const fetchRecipes = useCallback(async (householdId: string | null) => {
    if (!householdId) {
      console.log('RecipesContext: No household ID provided, skipping fetch');
      return;
    }

    // Prevent duplicate fetches
    if (lastFetchedHouseholdIdRef.current === householdId) {
      console.log('RecipesContext: Already fetched for this household, skipping');
      return;
    }
    
    console.time('[Performance] Recipes fetch');
    console.log('RecipesContext: Fetching recipes for household:', householdId);
    setIsLoading(true);
    setError(null);
    lastFetchedHouseholdIdRef.current = householdId;
    
    try {
      const fetchedRecipes = await api.fetchRecipesLite(householdId);
      console.log('RecipesContext: Fetched recipes:', fetchedRecipes.length);
      setRecipes(fetchedRecipes);
      
      // Automatically regenerate thumbnails for recipes with images
      // This fixes both missing thumbnails and incorrect thumbnails (like "Chili Soy Salmon")
      // Do this in the background to avoid blocking UI
      setTimeout(async () => {
        const { regenerateRecipeThumbnail } = await import('@/services/imageUploadService');
        for (const recipe of fetchedRecipes) {
          // Regenerate thumbnail if recipe has an image (regardless of whether thumbnail exists)
          // This ensures thumbnails always match the current image
          if (recipe.image && (recipe as any).created_by) {
            // Only regenerate if thumbnail is missing OR if we want to force regenerate all
            // For now, regenerate all to fix incorrect thumbnails
            const needsRegeneration = !(recipe as any).image_thumbnail;
            if (needsRegeneration) {
              console.log(`🔄 Auto-regenerating thumbnail for: ${recipe.title}`);
              try {
                const thumbnailUrl = await regenerateRecipeThumbnail(
                  recipe.id,
                  recipe.image,
                  (recipe as any).created_by
                );
                // Update the recipe in state after regeneration
                if (thumbnailUrl) {
                  setRecipes(prev => prev.map(r => 
                    r.id === recipe.id 
                      ? { ...r, image_thumbnail: thumbnailUrl } as any
                      : r
                  ));
                }
              } catch (error) {
                console.error(`❌ Failed to regenerate thumbnail for ${recipe.title}:`, error);
              }
            }
          }
        }
      }, 1000); // Wait 1 second after recipes are loaded
      
      console.timeEnd('[Performance] Recipes fetch');
    } catch (error) {
      console.error('RecipesContext: Error fetching recipes:', error);
      setError('Failed to load recipes');
      toast.error("Failed to load recipes");
      console.timeEnd('[Performance] Recipes fetch');
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  const getRecipeById = useCallback((id: string) => {
    return recipes.find(recipe => recipe.id === id);
  }, [recipes]);

  const getRecipeBySlug = useCallback((slug: string) => {
    return recipes.find(recipe => recipe.title.toLowerCase().replace(/\s+/g, '-') === slug);
  }, [recipes]);

  const createRecipe = useCallback(async (
    recipeData: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>,
    householdId: string
  ): Promise<Recipe | null> => {
    const newRecipe = await api.createRecipe(recipeData, householdId);
    if (newRecipe) {
      setRecipes(prev => [newRecipe, ...prev]);
    }
    return newRecipe;
  }, [api]);

  const updateRecipe = useCallback(async (id: string, recipeData: Partial<Recipe>): Promise<Recipe | null> => {
    const existingRecipe = getRecipeById(id);
    if (!existingRecipe) return null;

    try {
      const updatedRecipe = await api.updateRecipe(id, { ...existingRecipe, ...recipeData });
      if (updatedRecipe) {
        setRecipes(prev => prev.map(recipe => 
          recipe.id === id ? updatedRecipe : recipe
        ));
      }
      return updatedRecipe;
    } catch (error) {
      console.error('Error updating recipe:', error);
      toast.error("Failed to update recipe");
      return null;
    }
  }, [api, getRecipeById]);

  const deleteRecipe = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await api.deleteRecipe(id);
      if (success) {
        setRecipes(prev => prev.filter(recipe => recipe.id !== id));
        toast.success("Recipe moved to trash. You can restore it within 30 days from Settings.");
      }
      return success;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast.error("Failed to delete recipe");
      return false;
    }
  }, [api]);

  const fetchDeletedRecipes = useCallback(async (householdId: string): Promise<Recipe[]> => {
    try {
      return await api.fetchDeletedRecipes(householdId);
    } catch (error) {
      console.error('Error fetching deleted recipes:', error);
      toast.error("Failed to load deleted recipes");
      return [];
    }
  }, [api]);

  const restoreRecipe = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await api.restoreRecipe(id);
      if (success) {
        toast.success("Recipe restored successfully");
        // Refresh recipes to show the restored recipe
        if (currentHousehold?.id) {
          fetchRecipes(currentHousehold.id);
        }
      }
      return success;
    } catch (error) {
      console.error('Error restoring recipe:', error);
      toast.error("Failed to restore recipe");
      return false;
    }
  }, [api, currentHousehold?.id, fetchRecipes]);

  const permanentDeleteRecipe = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await api.permanentDeleteRecipe(id);
      if (success) {
        toast.success("Recipe permanently deleted");
      }
      return success;
    } catch (error) {
      console.error('Error permanently deleting recipe:', error);
      toast.error("Failed to permanently delete recipe");
      return false;
    }
  }, [api]);

  const toggleFavorite = useCallback(async (id: string, isFavorite: boolean): Promise<Recipe | null> => {
    const existingRecipe = getRecipeById(id);
    if (!existingRecipe) return null;

    try {
      const updatedRecipe = await updateRecipe(id, { is_favorite: isFavorite });
      return updatedRecipe;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error("Failed to update favourite status");
      return null;
    }
  }, [updateRecipe, getRecipeById]);

  const toggleCookingStatus = useCallback(async (id: string): Promise<Recipe | null> => {
    const existingRecipe = getRecipeById(id);
    if (!existingRecipe) {
      toast.error("Recipe not found");
      return null;
    }

    if (!currentHousehold?.id) {
      toast.error("No household selected");
      return null;
    }

    try {
      const newCookingStatus = await api.toggleCookingStatus(id, currentHousehold.id);
      const updatedRecipe = { ...existingRecipe, has_cooked: newCookingStatus };
      
      setRecipes(prev => prev.map(recipe => 
        recipe.id === id ? updatedRecipe : recipe
      ));

      toast.success(`Recipe marked as ${newCookingStatus ? 'cooked' : 'not cooked'}`);

      // Check achievements after marking as cooked
      if (newCookingStatus) {
        window.dispatchEvent(new CustomEvent('checkCookingAchievements', { 
          detail: { recipeId: id }
        }));
      }

      return updatedRecipe;
    } catch (error) {
      console.error('Error toggling cooking status:', error);
      toast.error("Failed to update cooking status");
      return null;
    }
  }, [api, getRecipeById, currentHousehold?.id]);

  const fetchRecipeById = useCallback(async (id: string): Promise<Recipe | null> => {
    try {
      return await api.fetchRecipeById(id);
    } catch (error) {
      console.error('Error fetching recipe by ID:', error);
      toast.error("Failed to load recipe details");
      return null;
    }
  }, [api]);

  const value: RecipesContextType = {
    recipes,
    isLoading,
    error,
    fetchRecipes,
    fetchRecipeById,
    getRecipeById,
    getRecipeBySlug,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite,
    toggleCookingStatus,
    fetchDeletedRecipes,
    restoreRecipe,
    permanentDeleteRecipe,
  };

  return (
    <RecipesContext.Provider value={value}>
      {children}
    </RecipesContext.Provider>
  );
};

export const useRecipes = () => {
  const context = useContext(RecipesContext);
  if (context === undefined) {
    throw new Error('useRecipes must be used within a RecipesProvider');
  }
  return context;
};
