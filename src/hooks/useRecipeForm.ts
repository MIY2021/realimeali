
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

  const [imagePreview, setImagePreview] = useState<string>("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const [shareWithCommunity, setShareWithCommunity] = useState(false);
  const [wasImportedFromWebsite, setWasImportedFromWebsite] = useState(false);

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
    setImagePreview("");
    setIsGeneratingImage(false);
    setGenerationProgress("");
    setShareWithCommunity(false);
    setWasImportedFromWebsite(false);
  };

  const markAsWebsiteImport = () => {
    setWasImportedFromWebsite(true);
    setShareWithCommunity(true);
  };

  const handleImageChange = (url: string) => {
    setNewRecipe({ ...newRecipe, image: url });
    setImagePreview(url);
  };

  const handleAddCategory = () => {
    // Implement category addition logic
  };

  const handleRemoveCategory = () => {
    // Implement category removal logic
  };

  const handleAddIngredient = () => {
    // Implement ingredient addition logic
  };

  const handleRemoveIngredient = () => {
    // Implement ingredient removal logic
  };

  const handleAddInstruction = () => {
    // Implement instruction addition logic
  };

  const handleRemoveInstruction = () => {
    // Implement instruction removal logic
  };

  return {
    newRecipe,
    setNewRecipe,
    resetForm,
    imagePreview,
    setImagePreview,
    isGeneratingImage,
    setIsGeneratingImage,
    generationProgress,
    setGenerationProgress,
    shareWithCommunity,
    setShareWithCommunity,
    wasImportedFromWebsite,
    markAsWebsiteImport,
    handleImageChange,
    handleAddCategory,
    handleRemoveCategory,
    handleAddIngredient,
    handleRemoveIngredient,
    handleAddInstruction,
    handleRemoveInstruction,
    newCategory: "",
    setNewCategory: () => {},
    newIngredient: "",
    setNewIngredient: () => {},
    newInstruction: "",
    setNewInstruction: () => {},
  };
};
