
import { useState } from "react";
import { Recipe, MealType, CuisineRegion, CookingMethod, DietLifestyle, ComplexityLevel, MainIngredient } from "@/types";

export function useRecipeForm() {
  const [newRecipe, setNewRecipe] = useState<Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>>({
    title: "",
    description: "",
    ingredients: [],
    instructions: [],
    // New classification fields
    meal_type: undefined,
    cuisine_region: undefined,
    cooking_method: undefined,
    diet_lifestyle: [],
    complexity_level: undefined,
    main_ingredient: undefined,
    prep_time: 0,
    cook_time: 0,
    servings: 1,
    image: undefined,
    top_tip: "Enjoy cooking this delicious recipe!", // Default top tip
    is_favorite: false,
    household_id: "",
  });

  const [newCategory, setNewCategory] = useState("");
  const [newIngredient, setNewIngredient] = useState("");
  const [newInstruction, setNewInstruction] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const [shareWithCommunity, setShareWithCommunity] = useState(false);
  const [wasImportedFromWebsite, setWasImportedFromWebsite] = useState(false);

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      // Add category logic here if needed
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (index: number) => {
    // Remove category logic here if needed
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setNewRecipe({
        ...newRecipe,
        ingredients: [...newRecipe.ingredients, newIngredient],
      });
      setNewIngredient("");
    }
  };

  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = [...newRecipe.ingredients];
    updatedIngredients.splice(index, 1);
    setNewRecipe({
      ...newRecipe,
      ingredients: updatedIngredients,
    });
  };

  const handleAddInstruction = () => {
    if (newInstruction.trim()) {
      setNewRecipe({
        ...newRecipe,
        instructions: [...newRecipe.instructions, newInstruction],
      });
      setNewInstruction("");
    }
  };

  const handleRemoveInstruction = (index: number) => {
    const updatedInstructions = [...newRecipe.instructions];
    updatedInstructions.splice(index, 1);
    setNewRecipe({
      ...newRecipe,
      instructions: updatedInstructions,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setNewRecipe({
          ...newRecipe,
          image: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper functions for new classification fields
  const handleMealTypeChange = (mealType: MealType | undefined) => {
    setNewRecipe({ ...newRecipe, meal_type: mealType });
  };

  const handleCuisineRegionChange = (cuisineRegion: CuisineRegion | undefined) => {
    setNewRecipe({ ...newRecipe, cuisine_region: cuisineRegion });
  };

  const handleCookingMethodChange = (cookingMethod: CookingMethod | undefined) => {
    setNewRecipe({ ...newRecipe, cooking_method: cookingMethod });
  };

  const handleDietLifestyleChange = (dietLifestyle: DietLifestyle[]) => {
    setNewRecipe({ ...newRecipe, diet_lifestyle: dietLifestyle });
  };

  const handleComplexityLevelChange = (complexityLevel: ComplexityLevel | undefined) => {
    setNewRecipe({ ...newRecipe, complexity_level: complexityLevel });
  };

  const handleMainIngredientChange = (mainIngredient: MainIngredient | undefined) => {
    setNewRecipe({ ...newRecipe, main_ingredient: mainIngredient });
  };

  // Function to mark recipe as imported from website and enable community sharing by default
  const markAsWebsiteImport = () => {
    setWasImportedFromWebsite(true);
    setShareWithCommunity(true); // Default to checked for website imports
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
    handleAddCategory,
    handleRemoveCategory,
    handleAddIngredient,
    handleRemoveIngredient,
    handleAddInstruction,
    handleRemoveInstruction,
    handleImageChange,
    handleMealTypeChange,
    handleCuisineRegionChange,
    handleCookingMethodChange,
    handleDietLifestyleChange,
    handleComplexityLevelChange,
    handleMainIngredientChange,
    markAsWebsiteImport,
  };
}
