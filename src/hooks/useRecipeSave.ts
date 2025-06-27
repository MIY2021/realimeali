
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types";
import { IngredientSectionParser } from "@/utils/ingredientSectionParser";

export function useRecipeSave() {
  const navigate = useNavigate();
  const { createRecipe } = useRecipes();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();

  const cleanIngredientsForSave = (ingredients: string[]): string[] => {
    // Parse ingredients into sections to identify headers
    const sections = IngredientSectionParser.parseIngredients(ingredients);
    
    // Extract only the actual ingredients, not the headers
    const cleanIngredients: string[] = [];
    sections.forEach(section => {
      cleanIngredients.push(...section.ingredients);
    });
    
    return cleanIngredients.filter(ing => ing && ing.trim().length > 0);
  };

  const handleSave = async (
    newRecipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>, 
    shareWithCommunity: boolean = false,
    originalSourceUrl?: string
  ) => {
    console.log("🍳 Save recipe called with:", { 
      newRecipe, 
      user: user?.id, 
      household: currentHousehold?.id,
      shareWithCommunity,
      originalSourceUrl,
      recipeData: {
        title: newRecipe.title,
        ingredients: newRecipe.ingredients?.length || 0,
        instructions: newRecipe.instructions?.length || 0,
        top_tip: newRecipe.top_tip,
        classification: {
          meal_type: newRecipe.meal_type,
          cuisine_region: newRecipe.cuisine_region,
          diet_lifestyle: newRecipe.diet_lifestyle,
          complexity_level: newRecipe.complexity_level,
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

    // Clean ingredients to remove section headers before saving
    const cleanedIngredients = cleanIngredientsForSave(newRecipe.ingredients || []);
    console.log("🧹 Cleaned ingredients:", { 
      original: newRecipe.ingredients?.length || 0, 
      cleaned: cleanedIngredients.length 
    });

    // Basic validation
    if (!newRecipe.title.trim()) {
      console.error("❌ Missing title");
      toast.error("Error", {
        description: "Recipe title is required",
      });
      return;
    }

    if (cleanedIngredients.length === 0) {
      console.error("❌ Missing ingredients after cleaning");
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

    // Clean and prepare recipe data
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
      // Use cleaned ingredients without section headers
      ingredients: cleanedIngredients,
      instructions: newRecipe.instructions.filter(inst => inst.trim()),
      diet_lifestyle: newRecipe.diet_lifestyle || [],
      // Remove household_id if present (will be set by createRecipe)
      household_id: undefined as any
    };

    console.log("✅ Validation passed, creating recipe with cleaned data:", recipeToSave);
    console.log("🌍 Share with community flag:", shareWithCommunity);
    
    try {
      console.log("🔄 Calling createRecipe function...");
      const recipe = await createRecipe(recipeToSave, currentHousehold.id);
      console.log("✅ Recipe creation response:", recipe);
      
      if (recipe) {
        // If user wants to share with community, submit it directly to community_recipes table
        if (shareWithCommunity) {
          console.log("🌍 Submitting recipe to community for moderation...");
          
          try {
            const communityRecipeData = {
              title: recipe.title,
              description: recipe.description || `A delicious ${recipe.meal_type || 'recipe'} recipe with ${recipe.ingredients.length} ingredients.`,
              source_url: originalSourceUrl || `${window.location.origin}/my-recipes/${recipe.id}`,
              image_url: recipe.image,
              prep_time: recipe.prep_time,
              cook_time: recipe.cook_time,
              servings: recipe.servings,
              category: recipe.meal_type || null,
              cuisine: recipe.cuisine_region || null,
              difficulty_level: recipe.complexity_level === 'quick_easy' ? 'Easy' : 
                             recipe.complexity_level === 'complex' ? 'Hard' : 'Standard',
              submitted_by: user.id,
              submitted_by_name: user.email || 'Anonymous',
              is_approved: false, // Requires admin approval
              is_active: true,
              moderation_status: 'pending'
            };

            console.log("📝 Community recipe data to be submitted:", communityRecipeData);

            const { data: communityRecipe, error: communityError } = await supabase
              .from('community_recipes')
              .insert(communityRecipeData)
              .select()
              .single();

            if (communityError) {
              console.error("❌ Community submission error:", communityError);
              toast.success("Recipe saved!", {
                description: `${recipe.title} has been added to your recipes. Community sharing failed but recipe is saved.`,
              });
            } else {
              console.log("✅ Recipe successfully submitted to community for moderation:", communityRecipe);
              toast.success("Recipe saved and submitted!", {
                description: `${recipe.title} has been added to your recipes and submitted to the community for moderation.`,
              });
            }
          } catch (communityError) {
            console.error("❌ Community submission failed:", communityError);
            toast.success("Recipe saved!", {
              description: `${recipe.title} has been added to your recipes. Community sharing failed but recipe is saved.`,
            });
          }
        } else {
          console.log("🎉 Recipe created successfully, no community sharing requested");
          toast.success("Recipe saved!", {
            description: `${recipe.title} has been added to your recipes.`,
          });
        }
        
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
