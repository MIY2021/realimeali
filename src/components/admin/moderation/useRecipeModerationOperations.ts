import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";

export function useRecipeModerationOperations(onRefresh: () => void) {
  const [generatingAI, setGeneratingAI] = useState<{ [key: string]: boolean }>({});
  const [uploadingFile, setUploadingFile] = useState<{ [key: string]: boolean }>({});
  const [savingFields, setSavingFields] = useState<{ [key: string]: boolean }>({});

  const generateAIImage = useCallback(async (recipe: CommunityRecipe) => {
    const loadingKey = `${recipe.id}-image`;
    setGeneratingAI(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      console.log("🎨 Starting AI image generation for recipe:", recipe.id, recipe.title);
      
      // Create a comprehensive prompt from title, description, and any available recipe details
      let prompt = `Generate a hyper-realistic, top-down food photograph of the recipe: "${recipe.title}"`;
      
      if (recipe.description && recipe.description.trim()) {
        prompt += ` - ${recipe.description.trim()}`;
      }

      // Add ingredients context if available (community recipes might have ingredients in description)
      const description = recipe.description || '';
      if (description.toLowerCase().includes('ingredients:')) {
        prompt += '. Recipe includes detailed ingredients for authentic presentation';
      }

      // Add cooking context from description
      const lowerDesc = description.toLowerCase();
      if (lowerDesc.includes('bake') || lowerDesc.includes('oven')) {
        prompt += '. Baked dish';
      } else if (lowerDesc.includes('fry') || lowerDesc.includes('pan')) {
        prompt += '. Pan-fried dish';
      } else if (lowerDesc.includes('grill')) {
        prompt += '. Grilled dish';
      } else if (lowerDesc.includes('boil') || lowerDesc.includes('simmer')) {
        prompt += '. Boiled/simmered dish';
      } else if (lowerDesc.includes('roast')) {
        prompt += '. Roasted dish';
      }

      prompt += `. Use natural lighting with soft shadows and realistic textures. Plate the dish in a ceramic or rustic-style plate or bowl. Garnish only with ingredients that would naturally accompany this dish. The background should be clean and natural (wood, stone, concrete, or linen). Include minimal, contextually appropriate props. The result must look like a professional, real-life food photograph with no digital or artificial appearance. Focus on authentic food presentation and natural colors.`;

      console.log("🎨 Enhanced prompt with recipe context:", prompt);

      const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
        body: { 
          prompt: prompt,
          isCommunityRecipe: true
        },
      });

      if (error) {
        console.error("❌ AI image generation error:", error);
        throw error;
      }

      if (!data?.imageUrl) {
        console.error("❌ No image URL in response:", data);
        throw new Error('No image URL received from AI generation');
      }

      console.log("✅ AI image generated successfully:", data.imageUrl);

      // Update the recipe with the new image URL
      const { error: updateError } = await supabase
        .from('community_recipes')
        .update({ 
          ai_generated_image_url: data.imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', recipe.id);

      if (updateError) {
        console.error("❌ Error updating recipe with AI image:", updateError);
        throw updateError;
      }

      toast.success("AI image generated and saved successfully!");
      onRefresh();

    } catch (error) {
      console.error("❌ Error in generateAIImage:", error);
      toast.error(
        error instanceof Error 
          ? `Failed to generate AI image: ${error.message}` 
          : "Failed to generate AI image. Please try again."
      );
    } finally {
      setGeneratingAI(prev => ({ ...prev, [loadingKey]: false }));
    }
  }, [onRefresh]);

  const generateAIDescription = useCallback(async (recipe: CommunityRecipe): Promise<string | null> => {
    const loadingKey = `${recipe.id}-description`;
    setGeneratingAI(prev => ({ ...prev, [loadingKey]: true }));

    try {
      console.log("🤖 Starting AI description generation for recipe:", recipe.id, recipe.title);

      const { data, error } = await supabase.functions.invoke('generate-community-description', {
        body: {
          recipeTitle: recipe.title,
          originalDescription: recipe.description || '',
          sourceUrl: recipe.source_url
        },
      });

      if (error) {
        console.error("❌ AI description generation error:", error);
        throw error;
      }

      if (!data?.description) {
        console.error("❌ No description in response:", data);
        throw new Error('No description received from AI generation');
      }

      console.log("✅ AI description generated successfully:", data.description);
      return data.description;

    } catch (error) {
      console.error("❌ Error in generateAIDescription:", error);
      toast.error(
        error instanceof Error 
          ? `Failed to generate AI description: ${error.message}` 
          : "Failed to generate AI description. Please try again."
      );
      return null;
    } finally {
      setGeneratingAI(prev => ({ ...prev, [loadingKey]: false }));
    }
  }, []);

  const uploadImageFile = useCallback(async (recipe: CommunityRecipe, file: File) => {
    setUploadingFile(prev => ({ ...prev, [recipe.id]: true }));
    
    try {
      console.log("📤 Starting file upload for recipe:", recipe.id, "File:", file.name);

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `community-recipe-${recipe.id}-${timestamp}.${fileExtension}`;

      console.log("📤 Uploading to storage with filename:", fileName);

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recipe-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error("❌ File upload error:", uploadError);
        throw uploadError;
      }

      console.log("✅ File uploaded successfully:", uploadData);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded image');
      }

      console.log("✅ Public URL generated:", urlData.publicUrl);

      // Update the recipe with the new image URL
      const { error: updateError } = await supabase
        .from('community_recipes')
        .update({ 
          ai_generated_image_url: urlData.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', recipe.id);

      if (updateError) {
        console.error("❌ Error updating recipe with uploaded image:", updateError);
        throw updateError;
      }

      toast.success("Image uploaded and saved successfully!");
      onRefresh();

    } catch (error) {
      console.error("❌ Error in uploadImageFile:", error);
      toast.error(
        error instanceof Error 
          ? `Failed to upload image: ${error.message}` 
          : "Failed to upload image. Please try again."
      );
    } finally {
      setUploadingFile(prev => ({ ...prev, [recipe.id]: false }));
    }
  }, [onRefresh]);

  const updateAIImageUrl = useCallback(async (recipe: CommunityRecipe, imageUrl: string) => {
    try {
      console.log("🔗 Updating AI image URL for recipe:", recipe.id, "URL:", imageUrl);

      if (!imageUrl.trim()) {
        throw new Error('Image URL cannot be empty');
      }

      const { error } = await supabase
        .from('community_recipes')
        .update({ 
          ai_generated_image_url: imageUrl.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', recipe.id);

      if (error) {
        console.error("❌ Error updating AI image URL:", error);
        throw error;
      }

      console.log("✅ AI image URL updated successfully");
      toast.success("Image URL updated successfully!");
      onRefresh();

    } catch (error) {
      console.error("❌ Error in updateAIImageUrl:", error);
      toast.error(
        error instanceof Error 
          ? `Failed to update image URL: ${error.message}` 
          : "Failed to update image URL. Please try again."
      );
    }
  }, [onRefresh]);

  const updateRecipeFields = useCallback(async (recipeId: string, updates: Partial<CommunityRecipe>) => {
    setSavingFields(prev => ({ ...prev, [recipeId]: true }));
    
    try {
      console.log("💾 Starting recipe fields update for recipe:", recipeId, "Updates:", updates);

      // Validate that we have something to update
      const hasValidUpdates = Object.entries(updates).some(([key, value]) => {
        if (key === 'id') return false; // Skip ID field
        return value !== null && value !== undefined && value !== '';
      });

      if (!hasValidUpdates) {
        throw new Error('No valid updates provided');
      }

      // Prepare the update object with timestamp
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Remove the ID from updates if it exists
      delete updateData.id;

      console.log("💾 Prepared update data:", updateData);

      const { data, error } = await supabase
        .from('community_recipes')
        .update(updateData)
        .eq('id', recipeId)
        .select('*')
        .single();

      if (error) {
        console.error("❌ Error updating recipe fields:", error);
        throw error;
      }

      console.log("✅ Recipe fields updated successfully:", data);
      toast.success("Recipe updated successfully!");
      onRefresh();

    } catch (error) {
      console.error("❌ Error in updateRecipeFields:", error);
      toast.error(
        error instanceof Error 
          ? `Failed to save changes: ${error.message}` 
          : "Failed to save changes. Please try again."
      );
    } finally {
      setSavingFields(prev => ({ ...prev, [recipeId]: false }));
    }
  }, [onRefresh]);

  const approveRecipe = useCallback(async (recipeId: string) => {
    try {
      console.log("✅ Approving recipe:", recipeId);

      const { error } = await supabase
        .from('community_recipes')
        .update({ 
          moderation_status: 'approved',
          is_approved: true,
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', recipeId);

      if (error) {
        console.error("❌ Error approving recipe:", error);
        throw error;
      }

      console.log("✅ Recipe approved successfully");
      toast.success("Recipe approved successfully!");
      onRefresh();

    } catch (error) {
      console.error("❌ Error in approveRecipe:", error);
      toast.error(
        error instanceof Error 
          ? `Failed to approve recipe: ${error.message}` 
          : "Failed to approve recipe. Please try again."
      );
    }
  }, [onRefresh]);

  const rejectRecipe = useCallback(async (recipeId: string) => {
    try {
      console.log("❌ Rejecting recipe:", recipeId);

      const { error } = await supabase
        .from('community_recipes')
        .update({ 
          moderation_status: 'rejected',
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', recipeId);

      if (error) {
        console.error("❌ Error rejecting recipe:", error);
        throw error;
      }

      console.log("✅ Recipe rejected successfully");
      toast.success("Recipe rejected successfully!");
      onRefresh();

    } catch (error) {
      console.error("❌ Error in rejectRecipe:", error);
      toast.error(
        error instanceof Error 
          ? `Failed to reject recipe: ${error.message}` 
          : "Failed to reject recipe. Please try again."
      );
    }
  }, [onRefresh]);

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
