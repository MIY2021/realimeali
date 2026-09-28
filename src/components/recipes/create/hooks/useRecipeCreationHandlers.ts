import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { uploadRecipeImage, uploadThumbnailFromUrl } from "@/services/imageUploadService";

export type RecipeOrigin = 'url' | 'image' | 'generate' | 'text' | 'manual' | 'whatcanImake';

interface UseRecipeCreationHandlersProps {
  recipeFormHook: any;
  recipeProcessingHook: any;
  setRecipeOrigin: (origin: RecipeOrigin) => void;
  setOriginalSourceUrl: (url: string) => void;
  setActiveTab: (tab: string) => void;
  recipeOrigin: RecipeOrigin;
  originalSourceUrl: string;
  isEditMode?: boolean;
  editingRecipe?: any;
  customMealPlanId?: string;
  onCustomMealSaved?: (savedRecipe: any) => Promise<void> | void;
}

export const useRecipeCreationHandlers = ({
  recipeFormHook,
  recipeProcessingHook,
  setRecipeOrigin,
  setOriginalSourceUrl,
  setActiveTab,
  recipeOrigin,
  originalSourceUrl,
  isEditMode = false,
  editingRecipe,
  customMealPlanId,
  onCustomMealSaved,
}: UseRecipeCreationHandlersProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { createRecipe, updateRecipe } = useRecipes();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const wrappedProcessText = () => {
    setRecipeOrigin('text');
    setOriginalSourceUrl('');
    return recipeProcessingHook.handleProcessText(
      (recipe: any) => recipeFormHook.setNewRecipe((prev: any) => ({ 
        ...prev, 
        ...recipe,
        source_url: null,
        import_method: 'text' as const
      })), 
      recipeFormHook.newRecipe, 
      setActiveTab
    );
  };
  
  const wrappedProcessImage = async (file: File) => {
    console.log('🔄 wrappedProcessImage called with file:', file.name);
    
    try {
      setRecipeOrigin('image');
      setOriginalSourceUrl('');
      
      console.log('🔄 Calling processImage...');
      const result = await recipeProcessingHook.processImage(file);
      console.log('🔄 processImage result:', result ? 'has data' : 'null/undefined');
      
      if (result) {
        // Don't extract imageFile - we don't want to use the uploaded image as recipe image
        const processedRecipe = {
          ...result,
          source_url: null,
          import_method: 'image' as const,
          image: undefined, // Ensure no image is set from the uploaded file
        };
        
        recipeFormHook.setNewRecipe((prev: any) => ({ ...prev, ...processedRecipe }));
        
        // Don't store the image file - copyright concerns
        // User can add their own image if they want
        
        console.log('🔄 Switching to manual tab');
        setActiveTab("manual");
      } else {
        console.error('🔄 processImage returned null/undefined');
        toast({
          title: "Processing Failed",
          description: "Failed to extract recipe from image. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('🔄 Error in wrappedProcessImage:', error);
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };
  
  const wrappedGenerateRecipe = async () => {
    setRecipeOrigin('generate');
    setOriginalSourceUrl('');
    const result = await recipeProcessingHook.generateRecipe({});
    if (result) {
      recipeFormHook.setNewRecipe((prev: any) => ({ 
        ...prev, 
        ...result,
        source_url: null,
        import_method: 'ai' as const
      }));
      setActiveTab("manual");
    }
  };
  
  const wrappedImportFromUrl = () => {
    setRecipeOrigin('url');
    setOriginalSourceUrl(recipeProcessingHook.recipeUrl);
    return recipeProcessingHook.handleImportFromUrl(
      (recipe: any) => {
        const { downloadedImageFile, ...recipeData } = recipe;
        
        recipeFormHook.setNewRecipe((prev: any) => ({ 
          ...prev, 
          ...recipeData,
          source_url: recipeProcessingHook.recipeUrl,
          import_method: 'url' as const,
          // Keep downloadedImageFile in the recipe object so it can be updated if user selects different image
          downloadedImageFile: downloadedImageFile
        }));
        
        // Store the downloaded image file for upload during save (initial auto-selected image)
        if (downloadedImageFile instanceof File) {
          console.log('📥 Storing downloaded image file for upload');
          recipeFormHook.setUploadedImageFile(downloadedImageFile);
        }
      }, 
      recipeFormHook.newRecipe, 
      setActiveTab
    );
  };

  const handleSaveRecipe = async () => {
    console.log('💾 Starting save recipe process...', { isEditMode });
    
    if (!user || !currentHousehold) {
      console.error('❌ Missing authentication:', { user: !!user, household: !!currentHousehold });
      toast({
        title: "Authentication Required",
        description: "You must be logged in and have a household to save recipes.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!recipeFormHook.newRecipe.meal_types || recipeFormHook.newRecipe.meal_types.length === 0) {
      toast({
        title: "Meal Type Required",
        description: "Please select at least one meal type for this recipe.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Extract group indices from ingredients that end with colon (for backward compatibility with edit interface)
      const ingredients = recipeFormHook.newRecipe.ingredients?.filter((ing: string) => ing && ing.trim().length > 0) || [];
      const groupIndices: number[] = [];
      for (let i = 0; i < ingredients.length; i++) {
        const ing = ingredients[i].trim();
        // If ingredient ends with colon (and isn't a ratio), it's a group header
        if (ing.endsWith(':') && !/\d+.*:/.test(ing)) {
          groupIndices.push(i);
        }
      }
      
      // Use existing group indices from AI parsing if available, otherwise use extracted indices
      const finalGroupIndices = recipeFormHook.newRecipe.ingredient_group_indices || 
        (groupIndices.length > 0 ? groupIndices : undefined);

      const recipeToSave = {
        ...recipeFormHook.newRecipe,
        title: recipeFormHook.newRecipe.title?.trim() || '',
        description: recipeFormHook.newRecipe.description?.trim() || '',
        top_tip: recipeFormHook.newRecipe.top_tip?.trim() || "Enjoy cooking this delicious recipe!",
        ingredients: ingredients,
        ingredient_group_indices: finalGroupIndices,
        instructions: recipeFormHook.newRecipe.instructions?.filter((inst: string) => inst?.trim()) || [],
        diet_lifestyle: recipeFormHook.newRecipe.diet_lifestyle || [],
        prep_time: Math.max(0, recipeFormHook.newRecipe.prep_time || 0),
        cook_time: Math.max(0, recipeFormHook.newRecipe.cook_time || 0),
        servings: Math.max(1, recipeFormHook.newRecipe.servings || 1),
        household_id: currentHousehold.id,
      };

      // Extract downloadedImageFile and suggestedTags if they exist (from URL import)
      const { downloadedImageFile, suggestedTags, ...recipeData } = recipeToSave as any;
      
      // Use downloadedImageFile if available, otherwise fall back to uploadedImageFile
      const imageFileToUpload = downloadedImageFile || recipeFormHook.uploadedImageFile;

      console.log('📋 Recipe data to save:', {
        ...recipeData,
        ingredients: recipeData.ingredients?.length || 0,
        instructions: recipeData.instructions?.length || 0,
        meal_types: recipeData.meal_types,
        cuisine_region: recipeData.cuisine_region,
        ingredient_group_indices: recipeData.ingredient_group_indices,
      });

      let savedRecipe;
      if (isEditMode && editingRecipe) {
        console.log('✏️ Updating recipe:', editingRecipe.id);
        savedRecipe = await updateRecipe(editingRecipe.id, recipeData);
      } else {
        console.log('➕ Creating new recipe');
        savedRecipe = await createRecipe(recipeData, currentHousehold.id);
      }
      
      console.log('💾 Save result:', savedRecipe ? { id: savedRecipe.id, title: savedRecipe.title } : 'null');
      
      // HALT IMMEDIATELY if recipe save failed
      if (!savedRecipe) {
        throw new Error('Recipe creation/update returned null. The recipe was not saved.');
      }
      
      console.log('✅ Recipe saved successfully:', savedRecipe.id);
      
      // Check if image has changed (for edit mode)
      const imageHasChanged = isEditMode && editingRecipe && 
        recipeData.image !== editingRecipe.image;
      
      // Upload image if a file was provided
      if (imageFileToUpload && user) {
        console.log('📸 Uploading image to storage...');
        try {
          const { fullUrl, thumbnailUrl } = await uploadRecipeImage(
            imageFileToUpload,
            user.id,
            savedRecipe.id
          );

          console.log('📸 Images uploaded, updating recipe with URLs...');
          const { error: updateError } = await supabase
            .from('recipes')
            .update({
              image: fullUrl,
              image_thumbnail: thumbnailUrl,
            })
            .eq('id', savedRecipe.id);

          if (updateError) {
            // HALT on image update error - don't continue
            throw new Error(`Failed to update recipe with image URLs: ${updateError.message}`);
          } else {
            console.log('✅ Recipe updated with image URLs');
            // Update the savedRecipe object with the new URLs for navigation
            savedRecipe.image = fullUrl;
            savedRecipe.image_thumbnail = thumbnailUrl;
          }
        } catch (imageError) {
          // HALT on image upload error
          console.error('❌ Failed to upload images:', imageError);
          throw new Error(`Failed to upload recipe image: ${imageError instanceof Error ? imageError.message : 'Unknown error'}`);
        }
      } else if (recipeData.image && user && (
        // Generate thumbnail if: no thumbnail exists OR image has changed
        !recipeData.image_thumbnail || imageHasChanged
      )) {
        console.log('📸 Generating thumbnail from image URL...', { 
          hasExistingThumbnail: !!recipeData.image_thumbnail,
          imageHasChanged 
        });
        try {
          const thumbnailUrl = await uploadThumbnailFromUrl(
            recipeData.image,
            user.id,
            savedRecipe.id
          );

          console.log('📸 Thumbnail generated, updating recipe...');
          const { error: updateError } = await supabase
            .from('recipes')
            .update({
              image_thumbnail: thumbnailUrl,
            })
            .eq('id', savedRecipe.id);

          if (updateError) {
            // HALT on thumbnail update error
            throw new Error(`Failed to update recipe with thumbnail URL: ${updateError.message}`);
          } else {
            console.log('✅ Recipe updated with thumbnail');
            savedRecipe.image_thumbnail = thumbnailUrl;
          }
        } catch (thumbnailError) {
          // Best-effort only: browser fetch() to third-party image URLs often fails (CORS / network).
          // Recipe is already saved with `image`; missing `image_thumbnail` is acceptable.
          console.warn(
            '⚠️ Thumbnail from external image URL skipped (e.g. CORS). Recipe still saved with full image.',
            thumbnailError
          );
        }
      }
      
      // Only show success and navigate if we got here without errors
      const action = isEditMode ? "updated" : "added to your recipe collection";
      const emoji = isEditMode ? "✏️" : "🎉";
      toast({
        title: `Recipe ${isEditMode ? "Updated" : "Saved"} Successfully! ${emoji}`,
        description: `${savedRecipe.title} has been ${action}.`,
      });
      
      if (isEditMode) {
        // Navigate back to recipe detail with potentially new slug
        const newSlug = savedRecipe.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        navigate(`/my-recipes/${newSlug}`);
      } else if (customMealPlanId && onCustomMealSaved) {
        await onCustomMealSaved(savedRecipe);
      } else {
        navigate("/my-recipes");
      }
      if (!customMealPlanId) setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error("❌ Error saving recipe:", error);
      let errorMessage = "Failed to save recipe. Please try again.";
      
      if (error instanceof Error) {
        console.error("❌ Error details:", {
          message: error.message,
          name: error.name,
          stack: error.stack,
          // Log the full error object for debugging
          fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        });
        
        // Show the actual error message to help debug
        const actualMessage = error.message || String(error);
        
        if (actualMessage.includes('Network') || actualMessage.includes('network')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (actualMessage.includes('duplicate') || actualMessage.includes('unique')) {
          errorMessage = "A recipe with this title already exists. Please use a different title.";
        } else if (actualMessage.includes('unauthorized') || actualMessage.includes('permission') || actualMessage.includes('403')) {
          errorMessage = "You don't have permission to save recipes. Please check your household membership.";
        } else if (actualMessage.includes('ingredient_group_indices') || actualMessage.includes('column') || actualMessage.includes('does not exist')) {
          // If the column doesn't exist, try saving without it
          console.warn("⚠️ ingredient_group_indices column may not exist, error:", actualMessage);
          errorMessage = `Database error: ${actualMessage}. Please run the migration to add ingredient_group_indices column.`;
        } else {
          // Show the actual error message for debugging
          errorMessage = `Error: ${actualMessage}`;
        }
      } else {
        console.error("❌ Non-Error object thrown:", error);
        errorMessage = `Unexpected error: ${JSON.stringify(error)}`;
      }
      
      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive",
      });
      // DO NOT navigate - halt all progress
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode && editingRecipe) {
      // Navigate back to the recipe detail page
      const slug = editingRecipe.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      navigate(`/my-recipes/${slug}`);
    } else {
      navigate("/my-recipes");
    }
  };

  return {
    wrappedProcessText,
    wrappedProcessImage,
    wrappedGenerateRecipe,
    wrappedImportFromUrl,
    handleSaveRecipe,
    handleCancel,
    isSaving,
  };
};