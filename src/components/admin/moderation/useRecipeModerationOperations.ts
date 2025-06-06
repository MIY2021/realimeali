import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";

export function useRecipeModerationOperations(onUpdate: () => Promise<void>) {
  const [generatingAI, setGeneratingAI] = useState<{ [key: string]: boolean }>({});
  const [uploadingFile, setUploadingFile] = useState<{ [key: string]: boolean }>({});
  const [savingFields, setSavingFields] = useState<{ [key: string]: boolean }>({});

  const generateAIImage = async (recipe: CommunityRecipe) => {
    setGeneratingAI(prev => ({ ...prev, [`${recipe.id}-image`]: true }));
    
    try {
      // Create the hyper-realistic prompt using the recipe title and description
      const prompt = `Generate a hyper-realistic, top-down food photograph of the recipe described in the provided title and description only: "${recipe.title}" - ${recipe.description || ''}. Do not invent ingredients or styling outside what's described. Use natural lighting with soft shadows and realistic textures. Plate the dish in a ceramic or rustic-style plate or bowl. Garnish only with ingredients specifically mentioned or clearly implied in the description. The background should vary between images (e.g., linen, wood, stone, concrete) but always remain clean and natural. Include minimal, relevant props (e.g., a fork, a napkin, or a wedge of cheese) only if they are contextually appropriate. The result must look like a professional, real-life food photograph with no digital or artificial appearance. Do not use imaginary or stylized elements. Use only the provided title and description as the source of truth for what the image contains.`;

      const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
        body: { 
          prompt: prompt,
          isCommunityRecipe: true
        },
      });

      if (error) throw error;

      if (!data?.imageUrl) {
        throw new Error('No image URL returned from AI generation');
      }

      // Update the recipe in the database - keep current moderation status
      const { error: updateError } = await supabase
        .from('community_recipes')
        .update({ 
          ai_generated_image_url: data.imageUrl
        })
        .eq('id', recipe.id);

      if (updateError) throw updateError;

      toast.success("AI image generated successfully");
      await onUpdate();
    } catch (error) {
      console.error('Error generating AI image:', error);
      toast.error("Failed to generate AI image");
    } finally {
      setGeneratingAI(prev => ({ ...prev, [`${recipe.id}-image`]: false }));
    }
  };

  const uploadImageFile = async (recipe: CommunityRecipe, file: File) => {
    setUploadingFile(prev => ({ ...prev, [recipe.id]: true }));
    
    try {
      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `community-recipe-${recipe.id}-${Date.now()}.${fileExtension}`;

      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recipe-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(fileName);

      // Update the recipe in the database - keep current moderation status
      const { error: updateError } = await supabase
        .from('community_recipes')
        .update({ 
          ai_generated_image_url: urlData.publicUrl
        })
        .eq('id', recipe.id);

      if (updateError) throw updateError;

      toast.success("Image uploaded successfully");
      await onUpdate();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingFile(prev => ({ ...prev, [recipe.id]: false }));
    }
  };

  const updateAIImageUrl = async (recipe: CommunityRecipe, imageUrl: string) => {
    try {
      // Update the recipe in the database - keep current moderation status
      const { error } = await supabase
        .from('community_recipes')
        .update({ 
          ai_generated_image_url: imageUrl
        })
        .eq('id', recipe.id);

      if (error) throw error;

      toast.success("Image URL updated successfully");
      await onUpdate();
    } catch (error) {
      console.error('Error updating image URL:', error);
      toast.error("Failed to update image URL");
    }
  };

  const updateRecipeFields = async (recipe: CommunityRecipe, updates: Partial<CommunityRecipe>) => {
    setSavingFields(prev => ({ ...prev, [recipe.id]: true }));
    
    try {
      const { error } = await supabase
        .from('community_recipes')
        .update({ 
          ...updates,
          moderation_status: 'in_review',
          updated_at: new Date().toISOString()
        })
        .eq('id', recipe.id);

      if (error) throw error;

      toast.success("Recipe details updated successfully");
      await onUpdate();
    } catch (error) {
      console.error('Error updating recipe fields:', error);
      toast.error("Failed to update recipe details");
    } finally {
      setSavingFields(prev => ({ ...prev, [recipe.id]: false }));
    }
  };

  const approveRecipe = async (recipeId: string) => {
    try {
      const { error } = await supabase
        .from('community_recipes')
        .update({
          moderation_status: 'approved',
          is_approved: true,
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', recipeId);

      if (error) throw error;

      toast.success("Recipe approved successfully");
      await onUpdate();
    } catch (error) {
      console.error('Error approving recipe:', error);
      toast.error("Failed to approve recipe");
    }
  };

  const rejectRecipe = async (recipeId: string) => {
    try {
      const { error } = await supabase
        .from('community_recipes')
        .update({
          moderation_status: 'rejected',
          is_active: false,
        })
        .eq('id', recipeId);

      if (error) throw error;

      toast.success("Recipe rejected");
      await onUpdate();
    } catch (error) {
      console.error('Error rejecting recipe:', error);
      toast.error("Failed to reject recipe");
    }
  };

  return {
    generateAIImage,
    uploadImageFile,
    updateAIImageUrl,
    updateRecipeFields,
    approveRecipe,
    rejectRecipe,
    generatingAI,
    uploadingFile,
    savingFields,
  };
}
