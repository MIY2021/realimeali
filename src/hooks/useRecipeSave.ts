
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
    if (!user || !currentHousehold) {
      toast.error("Error", {
        description: "You must be logged in and have a household selected.",
      });
      return;
    }

    // Basic validation
    if (!newRecipe.title.trim()) {
      toast.error("Error", {
        description: "Recipe title is required",
      });
      return;
    }

    if (newRecipe.ingredients.length === 0) {
      toast.error("Error", {
        description: "At least one ingredient is required",
      });
      return;
    }

    if (newRecipe.instructions.length === 0) {
      toast.error("Error", {
        description: "At least one instruction is required",
      });
      return;
    }

    const recipe = await createRecipe(newRecipe, currentHousehold.id);
    if (recipe) {
      navigate("/my-recipes");
    }
  };

  const handleCancel = () => {
    navigate("/my-recipes");
  };

  return { handleSave, handleCancel };
}
