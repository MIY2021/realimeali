
import { useState } from "react";
import { Recipe } from "@/types";

export interface RecipeFormData extends Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> {}

export const useRecipeForm = () => {
  const [newRecipe, setNewRecipe] = useState<RecipeFormData>({
    title: "",
    description: "",
    ingredients: [],
    instructions: [],
    mealType: undefined,
    cuisine: undefined,
    dietLifestyle: [],
    complexityLevel: undefined,
    prepTime: 0,
    cookTime: 0,
    servings: 4,
    image: undefined,
    isFavorite: false,
    householdId: "",
    slug: ""
  });

  const resetForm = () => {
    setNewRecipe({
      title: "",
      description: "",
      ingredients: [],
      instructions: [],
      mealType: undefined,
      cuisine: undefined,
      dietLifestyle: [],
      complexityLevel: undefined,
      prepTime: 0,
      cookTime: 0,
      servings: 4,
      image: undefined,
      isFavorite: false,
      householdId: "",
      slug: ""
    });
  };

  return {
    newRecipe,
    setNewRecipe,
    resetForm
  };
};
