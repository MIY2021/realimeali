
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";

export function useRecipeModerationOperations(onUpdate: () => Promise<void>) {
  const [generatingAI, setGeneratingAI] = useState<{ [key: string]: boolean }>({});

  const generateAIDescription = async (recipe: CommunityRecipe) => {
    setGeneratingAI(prev => ({ ...prev, [`${recipe.id}-desc`]: true }));
    
    try {
      const response = await fetch(`https://bdjzefekuahfofwzxqxd.supabase.co/functions/v1/generate-community-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkanplZmVrdWFoZm9md3p4cXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MjE1ODQsImV4cCI6MjA2MjI5NzU4NH0.AyzVwsNDgyjeveMtz4-6mVnJGr7DaU8ZUJhr5Yk_us8`,
        },
        body: JSON.stringify({
          recipeTitle: recipe.title,
          originalDescription: recipe.description,
          sourceUrl: recipe.source_url,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate description');

      const data = await response.json();
      
      // Update the recipe in the database
      const { error } = await supabase
        .from('community_recipes')
        .update({ 
          ai_generated_description: data.description,
          moderation_status: 'in_review'
        })
        .eq('id', recipe.id);

      if (error) throw error;

      toast.success("AI description generated successfully");
      await onUpdate();
    } catch (error) {
      console.error('Error generating AI description:', error);
      toast.error("Failed to generate AI description");
    } finally {
      setGeneratingAI(prev => ({ ...prev, [`${recipe.id}-desc`]: false }));
    }
  };

  const updateAIImageUrl = async (recipe: CommunityRecipe, imageUrl: string) => {
    try {
      const { error } = await supabase
        .from('community_recipes')
        .update({ 
          ai_generated_image_url: imageUrl,
          moderation_status: 'in_review'
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
    generateAIDescription,
    updateAIImageUrl,
    approveRecipe,
    rejectRecipe,
    generatingAI,
  };
}
