
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";

export function useRecipeModerationOperations(onRefresh: () => void) {
  const [generatingAI, setGeneratingAI] = useState<{ [key: string]: boolean }>({});
  const [uploadingFile, setUploadingFile] = useState<{ [key: string]: boolean }>({});
  const [savingFields, setSavingFields] = useState<{ [key: string]: boolean }>({});

  const generateAIImage = async (recipe: CommunityRecipe) => {
    const imageKey = `${recipe.id}-image`;
    
    try {
      setGeneratingAI(prev => ({ ...prev, [imageKey]: true }));
      console.log("🎨 Generating AI image for recipe:", recipe.title);
      
      const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
        body: { 
          title: recipe.title,
          description: recipe.description || recipe.ai_generated_description || ""
        }
      });

      if (error) throw error;

      if (data?.url) {
        await updateAIImageUrl(recipe, data.url);
        toast.success("AI image generated successfully!");
      } else {
        throw new Error("No image URL returned");
      }
    } catch (error) {
      console.error("❌ Error generating AI image:", error);
      toast.error("Failed to generate AI image");
    } finally {
      setGeneratingAI(prev => ({ ...prev, [imageKey]: false }));
    }
  };

  const uploadImageFile = async (recipe: CommunityRecipe, file: File) => {
    try {
      setUploadingFile(prev => ({ ...prev, [recipe.id]: true }));
      console.log("📁 Uploading image file for recipe:", recipe.title);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `recipe-${recipe.id}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recipe-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(fileName);

      await updateAIImageUrl(recipe, publicUrl);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingFile(prev => ({ ...prev, [recipe.id]: false }));
    }
  };

  const updateAIImageUrl = async (recipe: CommunityRecipe, imageUrl: string) => {
    try {
      console.log("🔄 Updating AI image URL for recipe:", recipe.id);
      
      const { error } = await supabase
        .from('community_recipes')
        .update({ ai_generated_image_url: imageUrl })
        .eq('id', recipe.id);

      if (error) throw error;
      
      console.log("✅ AI image URL updated successfully");
      onRefresh();
    } catch (error) {
      console.error("❌ Error updating AI image URL:", error);
      toast.error("Failed to update image URL");
    }
  };

  const updateRecipeFields = async (recipe: CommunityRecipe, updates: Partial<CommunityRecipe>) => {
    try {
      setSavingFields(prev => ({ ...prev, [recipe.id]: true }));
      console.log("💾 Updating recipe fields for:", recipe.id, updates);
      
      const { error } = await supabase
        .from('community_recipes')
        .update(updates)
        .eq('id', recipe.id);

      if (error) throw error;
      
      console.log("✅ Recipe fields updated successfully");
      toast.success("Recipe updated successfully!");
      onRefresh();
    } catch (error) {
      console.error("❌ Error updating recipe fields:", error);
      toast.error("Failed to update recipe");
    } finally {
      setSavingFields(prev => ({ ...prev, [recipe.id]: false }));
    }
  };

  const generateAIDescription = async (recipe: CommunityRecipe): Promise<string | null> => {
    const descriptionKey = `${recipe.id}-description`;
    
    try {
      setGeneratingAI(prev => ({ ...prev, [descriptionKey]: true }));
      console.log("🤖 Generating AI description for recipe:", recipe.title);
      
      const { data, error } = await supabase.functions.invoke('generate-community-description', {
        body: { 
          title: recipe.title,
          description: recipe.description || "",
          ingredients: recipe.ingredients || [],
          instructions: recipe.instructions || []
        }
      });

      if (error) throw error;

      if (data?.description) {
        console.log("✅ AI description generated successfully");
        toast.success("AI description generated!");
        return data.description;
      } else {
        throw new Error("No description returned");
      }
    } catch (error) {
      console.error("❌ Error generating AI description:", error);
      toast.error("Failed to generate AI description");
      return null;
    } finally {
      setGeneratingAI(prev => ({ ...prev, [descriptionKey]: false }));
    }
  };

  const approveRecipe = async (recipeId: string) => {
    try {
      console.log("✅ Approving recipe:", recipeId);
      
      const { error } = await supabase
        .from('community_recipes')
        .update({ 
          moderation_status: 'approved',
          moderated_at: new Date().toISOString()
        })
        .eq('id', recipeId);

      if (error) throw error;
      
      console.log("✅ Recipe approved successfully");
      toast.success("Recipe approved!");
      onRefresh();
    } catch (error) {
      console.error("❌ Error approving recipe:", error);
      toast.error("Failed to approve recipe");
    }
  };

  const rejectRecipe = async (recipeId: string) => {
    try {
      console.log("❌ Rejecting recipe:", recipeId);
      
      const { error } = await supabase
        .from('community_recipes')
        .update({ 
          moderation_status: 'rejected',
          moderated_at: new Date().toISOString()
        })
        .eq('id', recipeId);

      if (error) throw error;
      
      console.log("✅ Recipe rejected successfully");
      toast.success("Recipe rejected");
      onRefresh();
    } catch (error) {
      console.error("❌ Error rejecting recipe:", error);
      toast.error("Failed to reject recipe");
    }
  };

  return {
    generateAIImage,
    uploadImageFile,
    updateAIImageUrl,
    updateRecipeFields,
    generateAIDescription,
    approveRecipe,
    rejectRecipe,
    generatingAI,
    uploadingFile,
    savingFields
  };
}
