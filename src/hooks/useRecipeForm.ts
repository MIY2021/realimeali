
import { useState } from "react";
import { Recipe, DietLifestyle } from "@/types";

export const useRecipeForm = (initialRecipe?: Partial<Recipe>) => {
  const [newRecipe, setNewRecipe] = useState<Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>>({
    title: initialRecipe?.title || '',
    description: initialRecipe?.description || '',
    ingredients: initialRecipe?.ingredients || [],
    instructions: initialRecipe?.instructions || [],
    prep_time: initialRecipe?.prep_time || 0,
    cook_time: initialRecipe?.cook_time || 0,
    servings: initialRecipe?.servings || 1,
    image: initialRecipe?.image || '',
    is_favorite: initialRecipe?.is_favorite || false,
    household_id: initialRecipe?.household_id || '',
    meal_type: initialRecipe?.meal_type,
    cuisine_region: initialRecipe?.cuisine_region,
    cooking_method: initialRecipe?.cooking_method,
    diet_lifestyle: initialRecipe?.diet_lifestyle || [],
    complexity_level: initialRecipe?.complexity_level,
    main_ingredient: initialRecipe?.main_ingredient,
    top_tip: initialRecipe?.top_tip,
    slug: initialRecipe?.slug,
  });

  const [newCategory, setNewCategory] = useState('');
  const [newIngredient, setNewIngredient] = useState('');
  const [newInstruction, setNewInstruction] = useState('');

  const onAddCategory = () => {
    if (newCategory.trim()) {
      // Handle diet_lifestyle as proper DietLifestyle array
      setNewRecipe(prevRecipe => ({
        ...prevRecipe,
        diet_lifestyle: [...(prevRecipe.diet_lifestyle || []), newCategory.trim() as DietLifestyle]
      }));
      setNewCategory('');
    }
  };

  const onRemoveCategory = (categoryToRemove: string) => {
    setNewRecipe(prevRecipe => ({
      ...prevRecipe,
      diet_lifestyle: (prevRecipe.diet_lifestyle || []).filter(cat => cat !== categoryToRemove)
    }));
  };

  const onAddIngredient = () => {
    if (newIngredient.trim()) {
      setNewRecipe(prevRecipe => ({
        ...prevRecipe,
        ingredients: [...prevRecipe.ingredients, newIngredient.trim()]
      }));
      setNewIngredient('');
    }
  };

  const onRemoveIngredient = (ingredientToRemove: string) => {
    setNewRecipe(prevRecipe => ({
      ...prevRecipe,
      ingredients: prevRecipe.ingredients.filter(ing => ing !== ingredientToRemove)
    }));
  };

  const onAddInstruction = () => {
    if (newInstruction.trim()) {
      setNewRecipe(prevRecipe => ({
        ...prevRecipe,
        instructions: [...prevRecipe.instructions, newInstruction.trim()]
      }));
      setNewInstruction('');
    }
  };

  const onRemoveInstruction = (instructionToRemove: string) => {
    setNewRecipe(prevRecipe => ({
      ...prevRecipe,
      instructions: prevRecipe.instructions.filter(inst => inst !== instructionToRemove)
    }));
  };

  return {
    newRecipe,
    setNewRecipe,
    newCategory,
    setNewCategory,
    newIngredient,
    setNewIngredient,
    newInstruction,
    setNewInstruction,
    onAddCategory,
    onRemoveCategory,
    onAddIngredient,
    onRemoveIngredient,
    onAddInstruction,
    onRemoveInstruction,
  };
};
