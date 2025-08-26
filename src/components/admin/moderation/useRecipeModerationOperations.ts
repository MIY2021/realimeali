
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";

export function useRecipeModerationOperations(onRefresh: () => void) {
  const [generatingAI, setGeneratingAI] = useState<{ [key: string]: boolean }>({});
  const [uploadingFile, setUploadingFile] = useState<{ [key: string]: boolean }>({});
  const [savingFields, setSavingFields] = useState<{ [key: string]: boolean }>({});

  const generateAIImage = useCallback(async (recipe: CommunityRecipe) => {
    const key = `${recipe.id}-image`;
    setGeneratingAI(prev => ({ ...prev, [key]: true }));
    
    try {
      console.log("🎨 Starting AI image generation for recipe:", recipe.id);
      
      const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
        body: {
          recipeTitle: recipe.title,
          recipeDescription: recipe.description || recipe.ai_generated_description,
          referenceImageUrl: recipe.image_url,
        },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        console.log("✅ AI image generated successfully:", data.imageUrl);
        await updateAIImageUrl(recipe, data.imageUrl);
        toast.success("AI image generated successfully!");
      } else {
        throw new Error("No image URL returned from generation");
      }
    } catch (error) {
      console.error("❌ Error generating AI image:", error);
      toast.error("Failed to generate AI image");
    } finally {
      setGeneratingAI(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  const uploadImageFile = useCallback(async (recipe: CommunityRecipe, file: File) => {
    setUploadingFile(prev => ({ ...prev, [recipe.id]: true }));
    
    try {
      console.log("📤 Starting file upload for recipe:", recipe.id);
      
      // Here you would implement actual file upload to Supabase Storage
      // For now, we'll just show a placeholder
      toast.info("File upload functionality needs to be implemented with Supabase Storage");
      
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      toast.error("Failed to upload image file");
    } finally {
      setUploadingFile(prev => ({ ...prev, [recipe.id]: false }));
    }
  }, []);

  const updateAIImageUrl = useCallback(async (recipe: CommunityRecipe, imageUrl: string) => {
    try {
      console.log("🔗 Updating AI image URL for recipe:", recipe.id, "URL:", imageUrl);
      
      const { error } = await supabase
        .from('community_recipes')
        .update({ 
          ai_generated_image_url: imageUrl,
          image_source_type: 'ai',
          // Clear Unsplash data when setting AI image
          unsplash_image_url: null,
          photographer_name: null,
          photographer_profile_url: null,
        })
        .eq('id', recipe.id);

      if (error) throw error;

      console.log("✅ AI image URL updated successfully");
      onRefresh();
      toast.success("Image updated successfully!");
    } catch (error) {
      console.error("❌ Error updating AI image URL:", error);
      toast.error("Failed to update image URL");
    }
  }, [onRefresh]);

  const updateUnsplashImage = useCallback(async (
    recipe: CommunityRecipe, 
    imageUrl: string, 
    photographerName: string, 
    photographerUrl: string
  ) => {
    try {
      console.log("🌄 Updating Unsplash image for recipe:", recipe.id, {
        imageUrl, photographerName, photographerUrl
      });
      
      const { error } = await supabase
        .from('community_recipes')
        .update({ 
          unsplash_image_url: imageUrl,
          photographer_name: photographerName,
          photographer_profile_url: photographerUrl,
          image_source_type: 'unsplash',
          // Clear AI image when setting Unsplash image
          ai_generated_image_url: null,
        })
        .eq('id', recipe.id);

      if (error) throw error;

      console.log("✅ Unsplash image updated successfully");
      onRefresh();
      toast.success("Unsplash image selected successfully!");
    } catch (error) {
      console.error("❌ Error updating Unsplash image:", error);
      toast.error("Failed to update Unsplash image");
    }
  }, [onRefresh]);

  const updateRecipeFields = useCallback(async (recipeId: string, updates: Partial<CommunityRecipe>) => {
    setSavingFields(prev => ({ ...prev, [recipeId]: true }));
    
    try {
      console.log("💾 Updating recipe fields for:", recipeId, updates);
      
      const { error } = await supabase
        .from('community_recipes')
        .update(updates)
        .eq('id', recipeId);

      if (error) throw error;

      console.log("✅ Recipe fields updated successfully");
      onRefresh();
      toast.success("Recipe updated successfully!");
    } catch (error) {
      console.error("❌ Error updating recipe fields:", error);
      toast.error("Failed to update recipe");
    } finally {
      setSavingFields(prev => ({ ...prev, [recipeId]: false }));
    }
  }, [onRefresh]);

  const generateAIDescription = useCallback(async (recipe: CommunityRecipe): Promise<string | null> => {
    const key = `${recipe.id}-description`;
    setGeneratingAI(prev => ({ ...prev, [key]: true }));
    
    try {
      console.log("📝 Starting AI description generation for recipe:", recipe.id);
      
      const { data, error } = await supabase.functions.invoke('generate-community-description', {
        body: {
          title: recipe.title,
          originalDescription: recipe.description,
          sourceUrl: recipe.source_url,
        },
      });

      if (error) throw error;

      if (data?.description) {
        console.log("✅ AI description generated successfully");
        
        // Update the recipe with the new description
        await updateRecipeFields(recipe.id, {
          ai_generated_description: data.description
        });
        
        return data.description;
      } else {
        throw new Error("No description returned from generation");
      }
    } catch (error) {
      console.error("❌ Error generating AI description:", error);
      toast.error("Failed to generate AI description");
      return null;
    } finally {
      setGeneratingAI(prev => ({ ...prev, [key]: false }));
    }
  }, [updateRecipeFields]);

  const approveRecipe = useCallback(async (recipeId: string) => {
    try {
      console.log("✅ Approving recipe:", recipeId);
      
      const { error } = await supabase.rpc('approve_community_recipe', {
        recipe_id: recipeId
      });

      if (error) throw error;

      console.log("✅ Recipe approved successfully");
      onRefresh();
      toast.success("Recipe approved!");
    } catch (error) {
      console.error("❌ Error approving recipe:", error);
      toast.error("Failed to approve recipe");
    }
  }, [onRefresh]);

  const rejectRecipe = useCallback(async (recipeId: string) => {
    try {
      console.log("❌ Rejecting recipe:", recipeId);
      
      const { error } = await supabase.rpc('reject_community_recipe', {
        recipe_id: recipeId
      });

      if (error) throw error;

      console.log("✅ Recipe rejected successfully");
      onRefresh();
      toast.success("Recipe rejected");
    } catch (error) {
      console.error("❌ Error rejecting recipe:", error);
      toast.error("Failed to reject recipe");
    }
  }, [onRefresh]);

  return {
    generateAIImage,
    uploadImageFile,
    updateAIImageUrl,
    updateUnsplashImage,
    updateRecipeFields,
    generateAIDescription,
    approveRecipe,
    rejectRecipe,
    generatingAI,
    uploadingFile,
    savingFields,
  };
}
