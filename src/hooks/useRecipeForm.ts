import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types";

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
}

interface Instruction {
  id: string;
  text: string;
}

export function useRecipeForm(isEditing: boolean = false, existingRecipe?: Recipe) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [shareWithCommunity, setShareWithCommunity] = useState(true); // Default to true
  const [newRecipe, setNewRecipe] = useState<Recipe>(
    existingRecipe || {
      title: "",
      description: "",
      ingredients: [],
      instructions: [],
      prep_time: 15,
      cook_time: 30,
      servings: 4,
      top_tip: "",
      meal_type: "",
      cuisine_region: "",
      diet_lifestyle: [],
      complexity_level: "",
      main_ingredient: "",
      image: undefined,
      is_favorite: false,
      has_cooked: false,
      household_id: '',
    }
  );
  const [newIngredient, setNewIngredient] = useState<Omit<Ingredient, 'id'>>({ name: "", quantity: "" });
  const [newInstruction, setNewInstruction] = useState<Omit<Instruction, 'id'>>({ text: "" });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setNewRecipe(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview('');
      setNewRecipe(prev => ({ ...prev, image: undefined }));
    }
  };

  const handleAddIngredient = () => {
    if (newIngredient.name.trim() && newIngredient.quantity.trim()) {
      setNewRecipe(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, { id: crypto.randomUUID(), ...newIngredient }],
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

  const handleRemoveIngredient = (id: string) => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ingredient => ingredient.id !== id),
    }));
  };

  const handleAddInstruction = () => {
    if (newInstruction.text.trim()) {
      setNewRecipe(prev => ({
        ...prev,
        instructions: [...prev.instructions, { id: crypto.randomUUID(), text: newInstruction.text }],
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

  const handleRemoveInstruction = (id: string) => {
    setNewRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.filter(instruction => instruction.id !== id),
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
