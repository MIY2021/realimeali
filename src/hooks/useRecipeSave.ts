
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { Recipe } from "@/types";

export function useRecipeSave() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createRecipe } = useRecipes();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();

  const handleSave = async (newRecipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    if (!user || !currentHousehold) {
      toast({
        title: "Error",
        description: "You must be logged in and have a household selected.",
        variant: "destructive",
      });
      return;
    }

    // Basic validation
    if (!newRecipe.title.trim()) {
      toast({
        title: "Error",
        description: "Recipe title is required",
        variant: "destructive",
      });
      return;
    }

    if (newRecipe.ingredients.length === 0) {
      toast({
        title: "Error",
        description: "At least one ingredient is required",
        variant: "destructive",
      });
      return;
    }

    if (newRecipe.instructions.length === 0) {
      toast({
        title: "Error",
        description: "At least one instruction is required",
        variant: "destructive",
      });
      return;
    }

    const recipe = await createRecipe(newRecipe, currentHousehold.id);
    if (recipe) {
      navigate("/recipes");
    }
  };

  const handleCancel = () => {
    navigate("/recipes");
  };

  return { handleSave, handleCancel };
}
