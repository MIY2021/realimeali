
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types";

export function useRecipeForm(isEditing: boolean = false, existingRecipe?: Recipe) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [shareWithCommunity, setShareWithCommunity] = useState(true); // Default to true
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 useRecipeForm handleImageChange called:', e.target.files);
    
    const file = e.target.files?.[0];
    if (file) {
      console.log('📁 Processing uploaded file:', file.name, file.size);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        console.log('📁 Image processed, updating states:', result ? 'success' : 'failed');
        
        // Update both preview and recipe image
        setImagePreview(result);
        setNewRecipe(prev => ({ 
          ...prev, 
          image: result 
        }));
        console.log('📁 Updated newRecipe.image with uploaded file data');
      };
      reader.readAsDataURL(file);
    } else {
      console.log('📁 No file selected, clearing image states');
      // Clear both preview and recipe image
      setImagePreview('');
      setNewRecipe(prev => ({ 
        ...prev, 
        image: undefined 
      }));
      console.log('📁 Cleared newRecipe.image');
    }
  };

  const handleAddIngredient = () => {
    if (newIngredient.name.trim() && newIngredient.quantity.trim()) {
      const ingredientText = `${newIngredient.quantity} ${newIngredient.name}`;
      setNewRecipe(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, ingredientText],
      }));
      setNewIngredient({ name: "", quantity: "" }); // Clear input fields
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
      setNewInstruction({ text: "" }); // Clear input field
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
    imagePreview,
    setImagePreview,
    isGeneratingImage,
    setIsGeneratingImage,
    generationProgress,
    setGenerationProgress,
    shareWithCommunity,
    setShareWithCommunity,
    handleImageChange,
    handleAddIngredient,
    handleRemoveIngredient,
    handleAddInstruction,
    handleRemoveInstruction,
  };
}
