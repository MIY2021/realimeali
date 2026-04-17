import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types";
import { uploadRecipeImage, uploadThumbnailFromUrl } from "@/services/imageUploadService";

export function useRecipeSave() {
  const navigate = useNavigate();
  const { createRecipe } = useRecipes();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();

  const handleSave = async (
    newRecipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>, 
    uploadedImageFile?: File | null
  ) => {
    console.log("🍳 Save recipe called with:", { 
      newRecipe, 
      user: user?.id, 
      household: currentHousehold?.id,
      recipeData: {
        title: newRecipe.title,
        ingredients: newRecipe.ingredients?.length || 0,
        ingredientsList: newRecipe.ingredients,
        instructions: newRecipe.instructions?.length || 0,
        top_tip: newRecipe.top_tip,
        classification: {
          meal_type: newRecipe.meal_type,
          cuisine_region: newRecipe.cuisine_region,
          diet_lifestyle: newRecipe.diet_lifestyle,
        }
      }
    });
    
    
    if (!user || !currentHousehold) {
      console.error("❌ Missing user or household:", { user: !!user, household: !!currentHousehold });
      toast.error("Error", {
        description: "You must be logged in and have a household selected.",
      });
      return;
    }

    // KEEP ALL INGREDIENTS INCLUDING SECTION HEADERS - DO NOT CLEAN THEM
    const ingredientsToSave = newRecipe.ingredients || [];
    console.log("🧹 Preserving ALL ingredients including headers:", { 
      original: newRecipe.ingredients?.length || 0, 
      preserved: ingredientsToSave.length,
      ingredients: ingredientsToSave
    });

    // Basic validation
    if (!newRecipe.title.trim()) {
      console.error("❌ Missing title");
      toast.error("Error", {
        description: "Recipe title is required",
      });
      return;
    }

    if (ingredientsToSave.length === 0) {
      console.error("❌ Missing ingredients");
      toast.error("Error", {
        description: "At least one ingredient is required",
      });
      return;
    }

    if (!newRecipe.instructions || newRecipe.instructions.length === 0) {
      console.error("❌ Missing instructions");
      toast.error("Error", {
        description: "At least one instruction is required",
      });
      return;
    }

    // Clean and prepare recipe data - PRESERVE ALL INGREDIENTS
    const recipeToSave = {
      ...newRecipe,
      title: newRecipe.title.trim(),
      description: newRecipe.description?.trim() || "",
      top_tip: newRecipe.top_tip && newRecipe.top_tip.trim() 
        ? newRecipe.top_tip.trim()
        : "Enjoy cooking this delicious recipe!",
      // Ensure numeric values are valid
      prep_time: Math.max(0, newRecipe.prep_time || 0),
      cook_time: Math.max(0, newRecipe.cook_time || 0),
      servings: Math.max(1, newRecipe.servings || 1),
      // PRESERVE ALL INGREDIENTS INCLUDING SECTION HEADERS
      ingredients: ingredientsToSave,
      instructions: newRecipe.instructions.filter(inst => inst.trim()),
      diet_lifestyle: newRecipe.diet_lifestyle || [],
      // Remove household_id if present (will be set by createRecipe)
      household_id: undefined as any
    };

    console.log("✅ Validation passed, creating recipe with ALL ingredients preserved:", recipeToSave);

    try {
      console.log("🔄 Calling createRecipe function...");
      const recipe = await createRecipe(recipeToSave, currentHousehold.id);
      console.log("✅ Recipe creation response:", recipe);
      
      // HALT IMMEDIATELY if recipe creation failed
      if (!recipe) {
        throw new Error('Recipe creation returned null. The recipe was not saved.');
      }
      
      // Upload compressed images if a file was uploaded
      if (uploadedImageFile && user) {
        console.log("📸 Uploading compressed images to storage...");
        try {
          const { fullUrl, thumbnailUrl } = await uploadRecipeImage(
            uploadedImageFile,
            user.id,
            recipe.id
          );

          console.log("📸 Images uploaded successfully, updating recipe...");
          const { error: updateError } = await supabase
            .from('recipes')
            .update({
              image: fullUrl,
              image_thumbnail: thumbnailUrl,
            })
            .eq('id', recipe.id);

          if (updateError) {
            // HALT on image update error
            throw new Error(`Failed to update recipe with image URLs: ${updateError.message}`);
          } else {
            console.log("✅ Recipe updated with optimized images");
          }
        } catch (imageError) {
          // HALT on image upload error
          console.error("❌ Failed to upload images:", imageError);
          throw new Error(`Failed to upload recipe image: ${imageError instanceof Error ? imageError.message : 'Unknown error'}`);
        }
      } else if ((recipeToSave as any).image && user && !(recipeToSave as any).image_thumbnail) {
        // Generate and upload thumbnail from image URL if no file was uploaded and no thumbnail exists
        // This handles: new recipes with URL images, recipes where thumbnail generation failed previously
        console.log("📸 Generating thumbnail from image URL (no thumbnail exists)...");
        try {
          const thumbnailUrl = await uploadThumbnailFromUrl(
            (recipeToSave as any).image,
            user.id,
            recipe.id
          );

          console.log("📸 Thumbnail generated, updating recipe...");
          const { error: updateError } = await supabase
            .from('recipes')
            .update({
              image_thumbnail: thumbnailUrl,
            })
            .eq('id', recipe.id);

          if (updateError) {
            // HALT on thumbnail update error
            throw new Error(`Failed to update recipe with thumbnail URL: ${updateError.message}`);
          } else {
            console.log("✅ Recipe updated with thumbnail");
          }
        } catch (thumbnailError) {
          console.warn(
            "⚠️ Thumbnail from external image URL skipped (e.g. CORS). Recipe still saved with full image.",
            thumbnailError
          );
        }
      }
      
      // Only show success and navigate if we got here without errors
      console.log("🎉 Recipe created successfully");
      toast.success("Recipe saved!", {
        description: `${recipe.title} has been added to your recipes.`,
      });
      
      // Check recipe count achievements
      window.dispatchEvent(new CustomEvent('checkRecipeCountAchievements'));
      
      navigate("/my-recipes");
    } catch (error) {
      console.error("❌ Error creating recipe:", error);
      let errorMessage = "Failed to save recipe. Please check your input and try again.";
      
      if (error instanceof Error) {
        const actualMessage = error.message || String(error);
        if (actualMessage.includes('Network') || actualMessage.includes('network')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else {
          errorMessage = actualMessage;
        }
      }
      
      toast.error("Error", {
        description: errorMessage,
      });
      // DO NOT navigate - halt all progress
    }
  };

  const handleCancel = () => {
    navigate("/my-recipes");
  };

  return { handleSave, handleCancel };
}
