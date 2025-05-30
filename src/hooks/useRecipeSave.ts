
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useCommunityRecipes } from "@/hooks/useCommunityRecipes";
import { Recipe } from "@/types";

export function useRecipeSave() {
  const navigate = useNavigate();
  const { createRecipe } = useRecipes();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { submitCommunityRecipe } = useCommunityRecipes();

  const handleSave = async (
    newRecipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>, 
    shareWithCommunity: boolean = false
  ) => {
    console.log("🍳 Save recipe called with:", { 
      newRecipe, 
      user: user?.id, 
      household: currentHousehold?.id,
      shareWithCommunity,
      recipeData: {
        title: newRecipe.title,
        ingredients: newRecipe.ingredients?.length || 0,
        instructions: newRecipe.instructions?.length || 0,
        top_tip: newRecipe.top_tip,
        classification: {
          meal_type: newRecipe.meal_type,
          cuisine_region: newRecipe.cuisine_region,
          cooking_method: newRecipe.cooking_method,
          diet_lifestyle: newRecipe.diet_lifestyle,
          complexity_level: newRecipe.complexity_level,
          main_ingredient: newRecipe.main_ingredient,
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

    // Basic validation
    if (!newRecipe.title.trim()) {
      console.error("❌ Missing title");
      toast.error("Error", {
        description: "Recipe title is required",
      });
      return;
    }

    if (!newRecipe.ingredients || newRecipe.ingredients.length === 0) {
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
      // Ensure arrays are valid
      ingredients: newRecipe.ingredients.filter(ing => ing.trim()),
      instructions: newRecipe.instructions.filter(inst => inst.trim()),
      diet_lifestyle: newRecipe.diet_lifestyle || [],
      // Remove household_id if present (will be set by createRecipe)
      household_id: undefined as any
    };

    console.log("✅ Validation passed, creating recipe with cleaned data:", recipeToSave);
    try {
      console.log("🔄 Calling createRecipe function...");
      const recipe = await createRecipe(recipeToSave, currentHousehold.id);
      console.log("✅ Recipe creation response:", recipe);
      
      if (recipe) {
        // If user wants to share with community, submit it
        if (shareWithCommunity) {
          console.log("🌍 Submitting recipe to community...");
          
          // Try to extract source URL from description or other fields
          const sourceUrl = newRecipe.description?.match(/https?:\/\/[^\s]+/)?.[0] || 
                           window.location.origin + `/my-recipes/${recipe.id}`;
          
          const communityData = {
            title: recipe.title,
            description: recipe.description,
            source_url: sourceUrl,
            image_url: recipe.image,
            prep_time: recipe.prep_time,
            cook_time: recipe.cook_time,
            servings: recipe.servings,
            category: recipe.meal_type || null,
            cuisine: recipe.cuisine_region || null,
            difficulty_level: recipe.complexity_level === 'quick_easy' ? 'Easy' : 
                             recipe.complexity_level === 'complex' ? 'Hard' : 'Standard'
          };
          
          const submitted = await submitCommunityRecipe(communityData);
          
          if (submitted) {
            console.log("✅ Recipe successfully submitted to community");
            toast.success("Recipe saved and shared!", {
              description: `${recipe.title} has been added to your recipes and submitted to the community for review.`,
            });
          } else {
            console.log("❌ Community submission failed, but recipe was saved");
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
