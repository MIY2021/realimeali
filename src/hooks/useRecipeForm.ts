
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [shareWithCommunity, setShareWithCommunity] = useState(true); // Default to true
  const [wasImportedFromWebsite, setWasImportedFromWebsite] = useState(false);

  const onAddCategory = () => {
    if (newCategory.trim()) {
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

  // Fixed to use index instead of ingredient value
  const onRemoveIngredient = (indexToRemove: number) => {
    setNewRecipe(prevRecipe => ({
      ...prevRecipe,
      ingredients: prevRecipe.ingredients.filter((_, index) => index !== indexToRemove)
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

  // Fixed to use index instead of instruction value
  const onRemoveInstruction = (indexToRemove: number) => {
    setNewRecipe(prevRecipe => ({
      ...prevRecipe,
      instructions: prevRecipe.instructions.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setNewRecipe(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = onAddCategory;
  const handleRemoveCategory = onRemoveCategory;
  const handleAddIngredient = onAddIngredient;
  const handleRemoveIngredient = onRemoveIngredient;
  const handleAddInstruction = onAddInstruction;
  const handleRemoveInstruction = onRemoveInstruction;

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
    onAddCategory,
    onRemoveCategory,
    onAddIngredient,
    onRemoveIngredient,
    onAddInstruction,
    onRemoveInstruction,
    handleAddCategory,
    handleRemoveCategory,
    handleAddIngredient,
    handleRemoveIngredient,
    handleAddInstruction,
    handleRemoveInstruction,
  };
};
