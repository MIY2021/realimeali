
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { Recipe } from "@/types";

export function useRecipeSave() {
  const navigate = useNavigate();
  const { createRecipe } = useRecipes();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();

  const handleSave = async (newRecipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    console.log("🍳 Save recipe called with:", { 
      newRecipe, 
      user: user?.id, 
      household: currentHousehold?.id,
      recipeData: {
        title: newRecipe.title,
        ingredients: newRecipe.ingredients?.length || 0,
        instructions: newRecipe.instructions?.length || 0,
        topTip: newRecipe.topTip
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

    // Ensure the recipe has a top tip - add a default one if missing
    const recipeToSave = {
      ...newRecipe,
      topTip: newRecipe.topTip && newRecipe.topTip.trim() 
        ? newRecipe.topTip 
        : "Enjoy cooking this delicious recipe!"
    };

    console.log("✅ Validation passed, creating recipe with data:", recipeToSave);
    try {
      console.log("🔄 Calling createRecipe function...");
      const recipe = await createRecipe(recipeToSave, currentHousehold.id);
      console.log("✅ Recipe creation response:", recipe);
      
      if (recipe) {
        console.log("🎉 Recipe created successfully, navigating to /my-recipes");
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
        description: "Failed to save recipe. Please try again.",
      });
    }
  };

  const handleCancel = () => {
    navigate("/my-recipes");
  };

  return { handleSave, handleCancel };
}
