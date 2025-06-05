
import { useState } from "react";
import { Recipe } from "@/types";
import { useHousehold } from "@/contexts/HouseholdContext";

export function useRecipeState() {
  const { currentHousehold } = useHousehold();
  
  const [newRecipe, setNewRecipe] = useState<Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>>({
    title: "",
    description: "",
    ingredients: [],
    instructions: [],
    prep_time: 0,
    cook_time: 0,
    servings: 1,
    image: "",
    top_tip: "",
    household_id: currentHousehold?.id || "",
    is_favorite: false,
    has_cooked: false,
    meal_type: null,
    cuisine_region: null,
    diet_lifestyle: [],
    complexity_level: null,
    main_ingredient: null,
  });

  const [shareWithCommunity, setShareWithCommunity] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRecipe(prevRecipe => ({
      ...prevRecipe,
      [name]: value,
    }));
  };

  const handleIngredientsChange = (ingredients: string[]) => {
    setNewRecipe(prevRecipe => ({ ...prevRecipe, ingredients }));
  };

  const handleInstructionsChange = (instructions: string[]) => {
    setNewRecipe(prevRecipe => ({ ...prevRecipe, instructions }));
  };

  return {
    newRecipe,
    setNewRecipe,
    shareWithCommunity,
    setShareWithCommunity,
    handleInputChange,
    handleIngredientsChange,
    handleInstructionsChange,
  };
}
