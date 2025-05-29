import { useState } from "react";
import { Recipe } from "@/types";

export function useRecipeForm() {
  const [newRecipe, setNewRecipe] = useState<Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>>({
    title: "",
    description: "",
    ingredients: [],
    instructions: [],
    prep_time: 0,
    cook_time: 0,
    servings: 1,
    image: "",
    is_favorite: false,
    household_id: "",
    meal_type: undefined,
    cuisine: undefined,
    diet_lifestyle: [],
    complexity_level: undefined,
    slug: undefined,
    top_tip: undefined,
    cuisine_region: undefined,
    cooking_method: undefined,
    main_ingredient: undefined,
  });

  const [newCategory, setNewCategory] = useState("");
  const [newIngredient, setNewIngredient] = useState("");
  const [newInstruction, setNewInstruction] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const [shareWithCommunity, setShareWithCommunity] = useState(false);
  const [wasImportedFromWebsite, setWasImportedFromWebsite] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setNewRecipe({ ...newRecipe, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() !== "") {
      setNewRecipe((prevRecipe) => {
        const updatedCategories = [...(prevRecipe.diet_lifestyle || []), newCategory.trim()];
        return { ...prevRecipe, diet_lifestyle: updatedCategories };
      });
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setNewRecipe((prevRecipe) => {
      const updatedCategories = (prevRecipe.diet_lifestyle || []).filter(
        (category) => category !== categoryToRemove
      );
      return { ...prevRecipe, diet_lifestyle: updatedCategories };
    });
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim() !== "") {
      setNewRecipe((prevRecipe) => {
        const updatedIngredients = [...prevRecipe.ingredients, newIngredient.trim()];
        return { ...prevRecipe, ingredients: updatedIngredients };
      });
      setNewIngredient("");
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setNewRecipe((prevRecipe) => {
      const updatedIngredients = prevRecipe.ingredients.filter(
        (ingredient) => ingredient !== ingredientToRemove
      );
      return { ...prevRecipe, ingredients: updatedIngredients };
    });
  };

  const handleAddInstruction = () => {
    if (newInstruction.trim() !== "") {
      setNewRecipe((prevRecipe) => {
        const updatedInstructions = [...prevRecipe.instructions, newInstruction.trim()];
        return { ...prevRecipe, instructions: updatedInstructions };
      });
      setNewInstruction("");
    }
  };

  const handleRemoveInstruction = (instructionToRemove: string) => {
    setNewRecipe((prevRecipe) => {
      const updatedInstructions = prevRecipe.instructions.filter(
        (instruction) => instruction !== instructionToRemove
      );
      return { ...prevRecipe, instructions: updatedInstructions };
    });
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
    imagePreview,
    setImagePreview,
    isGeneratingImage,
    setIsGeneratingImage,
    generationProgress,
    setGenerationProgress,
    shareWithCommunity,
    setShareWithCommunity,
    wasImportedFromWebsite,
    setWasImportedFromWebsite,
    handleImageChange,
    handleAddCategory,
    handleRemoveCategory,
    handleAddIngredient,
    handleRemoveIngredient,
    handleAddInstruction,
    handleRemoveInstruction,
  };
}
