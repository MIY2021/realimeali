
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types";

export function useRecipeForm(isEditing: boolean = false, existingRecipe?: Recipe) {
  const { toast } = useToast();
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [shareWithCommunity, setShareWithCommunity] = useState(true);
  const [newRecipe, setNewRecipe] = useState<Recipe>(
    existingRecipe || {
      id: '',
      title: "",
      description: "",
      ingredients: [],
      instructions: [],
      prep_time: 15,
      cook_time: 30,
      servings: 4,
      top_tip: "",
      meal_type: undefined,
      cuisine_region: undefined,
      diet_lifestyle: [],
      complexity_level: undefined,
      main_ingredient: undefined,
      image: undefined,
      is_favorite: false,
      has_cooked: false,
      household_id: '',
      created_at: '',
      updated_at: '',
      created_by: '',
    }
  );
  const [newIngredient, setNewIngredient] = useState({ name: "", quantity: "" });
  const [newInstruction, setNewInstruction] = useState({ text: "" });

  // Use recipe.image as the single source of truth for image preview
  const imagePreview = newRecipe.image || '';

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 useRecipeForm handleImageChange called:', e.target.files?.length || 'no files');
    
    const file = e.target.files?.[0];
    if (file) {
      console.log('📁 Processing uploaded file:', file.name, file.size);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        console.log('📁 File read complete, updating recipe image');
        
        // Update recipe image directly - single source of truth
        setNewRecipe(prev => {
          const updated = { ...prev, image: result };
          console.log('📁 Updated newRecipe.image with uploaded file data');
          return updated;
        });
      };
      reader.onerror = (error) => {
        console.error('❌ Error reading file:', error);
        toast({
          title: "Error",
          description: "Failed to read the image file. Please try again.",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    } else {
      console.log('📁 No file selected, clearing recipe image');
      // Clear recipe image
      setNewRecipe(prev => {
        const updated = { ...prev, image: undefined };
        console.log('📁 Cleared newRecipe.image');
        return updated;
      });
    }
  };

  // Function to set image from URL or generation
  const setImageFromUrl = (imageUrl: string) => {
    console.log('🌐 Setting image from URL:', imageUrl ? 'has URL' : 'clearing');
    setNewRecipe(prev => ({
      ...prev,
      image: imageUrl || undefined
    }));
  };

  const handleAddIngredient = () => {
    if (newIngredient.name.trim() && newIngredient.quantity.trim()) {
      const ingredientText = `${newIngredient.quantity} ${newIngredient.name}`;
      setNewRecipe(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, ingredientText],
      }));
      setNewIngredient({ name: "", quantity: "" });
    } else {
      toast({
        title: "Error",
        description: "Ingredient name and quantity cannot be empty.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleAddInstruction = () => {
    if (newInstruction.text.trim()) {
      setNewRecipe(prev => ({
        ...prev,
        instructions: [...prev.instructions, newInstruction.text],
      }));
      setNewInstruction({ text: "" });
    } else {
      toast({
        title: "Error",
        description: "Instruction text cannot be empty.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveInstruction = (index: number) => {
    setNewRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };

  return {
    newRecipe,
    setNewRecipe,
    newIngredient,
    setNewIngredient,
    newInstruction,
    setNewInstruction,
    imagePreview, // This now directly uses newRecipe.image
    setImagePreview: setImageFromUrl, // Use the URL setter function
    isGeneratingImage,
    setIsGeneratingImage,
    generationProgress,
    setGenerationProgress,
    shareWithCommunity,
    setShareWithCommunity,
    handleImageChange,
    setImageFromUrl, // Add this for external image setting
    handleAddIngredient,
    handleRemoveIngredient,
    handleAddInstruction,
    handleRemoveInstruction,
  };
}
