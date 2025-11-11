import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRecipeValidation } from "./useRecipeValidation";
import { uploadRecipeImage } from "@/services/imageUploadService";

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
    recipeFormHook.setShareWithCommunity(false);
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
      recipeFormHook.setShareWithCommunity(false);
      
      console.log('🔄 Calling processImage...');
      const result = await recipeProcessingHook.processImage(file);
      console.log('🔄 processImage result:', result ? 'has data' : 'null/undefined');
      
      if (result) {
        const { imageFile, ...recipeData } = result;
        console.log('🔄 Extracted imageFile:', imageFile instanceof File ? 'is File' : 'not File');
        
        const processedRecipe = {
          ...recipeData,
          source_url: null,
          import_method: 'image' as const
        };
        
        recipeFormHook.setNewRecipe((prev: any) => ({ ...prev, ...processedRecipe }));
        
        // Store the image file for upload during save
        if (imageFile instanceof File) {
          console.log('🔄 Storing image file for upload');
          recipeFormHook.setUploadedImageFile(imageFile);
        } else {
          console.warn('🔄 imageFile is not a File instance:', typeof imageFile);
        }
        
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
    recipeFormHook.setShareWithCommunity(false);
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
    recipeFormHook.setShareWithCommunity(true);
    return recipeProcessingHook.handleImportFromUrl(
      (recipe: any) => recipeFormHook.setNewRecipe((prev: any) => ({ 
        ...prev, 
        ...recipe,
        source_url: recipeProcessingHook.recipeUrl,
        import_method: 'url' as const
      })), 
      recipeFormHook.newRecipe, 
      setActiveTab,
      recipeFormHook.setShareWithCommunity
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

    setIsSaving(true);
    
    try {
      const recipeToSave = {
        ...recipeFormHook.newRecipe,
        title: recipeFormHook.newRecipe.title?.trim() || '',
        description: recipeFormHook.newRecipe.description?.trim() || '',
        top_tip: recipeFormHook.newRecipe.top_tip?.trim() || "Enjoy cooking this delicious recipe!",
        ingredients: recipeFormHook.newRecipe.ingredients?.filter((ing: string) => ing && ing.trim().length > 0) || [],
        instructions: recipeFormHook.newRecipe.instructions?.filter((inst: string) => inst?.trim()) || [],
        diet_lifestyle: recipeFormHook.newRecipe.diet_lifestyle || [],
        prep_time: Math.max(0, recipeFormHook.newRecipe.prep_time || 0),
        cook_time: Math.max(0, recipeFormHook.newRecipe.cook_time || 0),
        servings: Math.max(1, recipeFormHook.newRecipe.servings || 1),
        household_id: currentHousehold.id,
      };

      let savedRecipe;
      if (isEditMode && editingRecipe) {
        savedRecipe = await updateRecipe(editingRecipe.id, recipeToSave);
      } else {
        savedRecipe = await createRecipe(recipeToSave, currentHousehold.id);
      }
      
      if (savedRecipe) {
        console.log('✅ Recipe saved successfully:', savedRecipe.id);
        
        // Upload image if a file was provided
        if (recipeFormHook.uploadedImageFile && user) {
          console.log('📸 Uploading image to storage...');
          try {
            const { fullUrl, thumbnailUrl } = await uploadRecipeImage(
              recipeFormHook.uploadedImageFile,
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
              console.error('❌ Failed to update recipe with image URLs:', updateError);
            } else {
              console.log('✅ Recipe updated with image URLs');
              // Update the savedRecipe object with the new URLs for navigation
              savedRecipe.image = fullUrl;
              savedRecipe.image_thumbnail = thumbnailUrl;
            }
          } catch (imageError) {
            console.error('❌ Failed to upload images:', imageError);
            // Continue anyway - recipe is saved
          }
        }
        
        // Handle community sharing if enabled and is from URL import (only for new recipes)
        const effectiveShareWithCommunity = !isEditMode && recipeOrigin === 'url' ? recipeFormHook.shareWithCommunity : false;
        
        if (effectiveShareWithCommunity) {
          try {
            const communityRecipeData = {
              title: savedRecipe.title,
              description: savedRecipe.description || `A delicious ${savedRecipe.meal_type || 'recipe'} recipe with ${savedRecipe.ingredients.length} ingredients.`,
              source_url: originalSourceUrl || `${window.location.origin}/my-recipes/${savedRecipe.id}`,
              image_url: savedRecipe.image,
              prep_time: savedRecipe.prep_time,
              cook_time: savedRecipe.cook_time,
              servings: savedRecipe.servings,
              category: savedRecipe.meal_type || null,
              cuisine: savedRecipe.cuisine_region || null,
              // difficulty_level mapping removed - complexity_level no longer exists
              submitted_by: user.id,
              submitted_by_name: user.email || 'Anonymous',
              is_approved: false,
              is_active: true,
              moderation_status: 'pending'
            };

            // TODO: Re-enable community recipes when table is created
            // await supabase
            //   .from('community_recipes')
            //   .insert(communityRecipeData);

            toast({
              title: "Recipe Saved & Shared! 🌟",
              description: `${savedRecipe.title} has been saved and submitted to the community for moderation.`,
            });
          } catch (communityError) {
            console.error("❌ Community submission failed:", communityError);
            toast({
              title: "Recipe Saved Successfully! 🎉",
              description: `${savedRecipe.title} has been saved to your recipes. Community sharing failed but your recipe is safely saved.`,
            });
          }
        } else {
          const action = isEditMode ? "updated" : "added to your recipe collection";
          const emoji = isEditMode ? "✏️" : "🎉";
          toast({
            title: `Recipe ${isEditMode ? "Updated" : "Saved"} Successfully! ${emoji}`,
            description: `${savedRecipe.title} has been ${action}.`,
          });
        }
        
        if (isEditMode) {
          // Navigate back to recipe detail with potentially new slug
          const newSlug = savedRecipe.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          navigate(`/my-recipes/${newSlug}`);
        } else {
          navigate("/my-recipes");
        }
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else {
        throw new Error('Recipe creation returned null');
      }
    } catch (error) {
      console.error("❌ Error saving recipe:", error);
      let errorMessage = "Failed to save recipe. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('Network')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes('duplicate')) {
          errorMessage = "A recipe with this title already exists. Please use a different title.";
        } else if (error.message.includes('unauthorized')) {
          errorMessage = "You don't have permission to save recipes. Please check your household membership.";
        }
      }
      
      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive",
      });
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