import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types";
import { uploadRecipeImage } from "@/services/imageUploadService";

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
      
      if (recipe) {
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
              console.error("❌ Failed to update recipe with image URLs:", updateError);
            } else {
              console.log("✅ Recipe updated with optimized images");
            }
          } catch (imageError) {
            console.error("❌ Failed to upload images:", imageError);
            // Continue anyway - recipe is saved
          }
        }
        
        console.log("🎉 Recipe created successfully");
        toast.success("Recipe saved!", {
          description: `${recipe.title} has been added to your recipes.`,
        });
        
        navigate("/my-recipes");
      } else {
        console.error("❌ Recipe creation returned null/undefined");
        toast.error("Error", {
          description: "Failed to save recipe. Please try again.",
        });
      }
    } catch (error) {
      console.error("❌ Error creating recipe:", error);
      toast.error("Error", {
        description: "Failed to save recipe. Please check your input and try again.",
      });
    }
  };

  const handleCancel = () => {
    navigate("/my-recipes");
  };

  return { handleSave, handleCancel };
}
