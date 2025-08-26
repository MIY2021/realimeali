
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";
import { RecipeFormHeader } from "./components/RecipeFormHeader";
import { RecipeTitleInput } from "./components/RecipeTitleInput";
import { RecipeDescriptionInput } from "./components/RecipeDescriptionInput";
import { MealTypeSelector } from "./components/MealTypeSelector";
import { CuisineSelector } from "./components/CuisineSelector";
import { DietLifestyleSelector } from "./components/DietLifestyleSelector";
import { SaveButton } from "./components/SaveButton";

interface ModerationRecipeEditorProps {
  recipe: CommunityRecipe;
  onSave: (updates: Partial<CommunityRecipe>) => void;
  onGenerateAIDescription: (recipe: CommunityRecipe) => Promise<string | null>;
  isSaving: boolean;
  isGeneratingAIDescription: boolean;
}

export function ModerationRecipeEditor({
  recipe,
  onSave,
  onGenerateAIDescription,
  isSaving,
  isGeneratingAIDescription,
}: ModerationRecipeEditorProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string | string[]>("");
  const [cuisine, setCuisine] = useState("");
  const [selectedDietLifestyle, setSelectedDietLifestyle] = useState<string[]>([]);

  // Reset state whenever recipe changes with enhanced logging
  useEffect(() => {
    console.log("🔄 Recipe changed in editor, updating state:", {
      newRecipeId: recipe.id,
      newRecipeTitle: recipe.title,
      previousTitle: title
    });
    
    setTitle(recipe.title || "");
    setDescription(recipe.description || "");
    setCategory(recipe.category || "");
    setCuisine(recipe.cuisine || "");
    setSelectedDietLifestyle([]);
    
    console.log("🔄 State updated for recipe:", recipe.id);
  }, [recipe.id]); // Only depend on recipe.id to prevent excessive re-renders

  const handleSave = () => {
    console.log("💾 Preparing to save recipe updates:", {
      recipeId: recipe.id,
      title: title.trim(),
      description: description.trim(),
      category,
      cuisine
    });

    // Validate required fields
    if (!title.trim()) {
      console.error("❌ Cannot save: Title is required");
      return;
    }

    const updates: Partial<CommunityRecipe> = {
      title: title.trim(),
      description: description.trim(),
      category: Array.isArray(category) ? category.join(',') : (category || null),
      cuisine: cuisine || null,
    };
    
    console.log("💾 Calling onSave with updates:", updates);
    onSave(updates);
  };

  const handleGenerateAIDescription = async () => {
    console.log("🤖 Generating AI description for recipe:", recipe.id);
    const aiDescription = await onGenerateAIDescription(recipe);
    if (aiDescription) {
      console.log("✅ AI description received, updating state");
      setDescription(aiDescription);
    }
  };

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-white/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Edit Recipe Details</CardTitle>
        <RecipeFormHeader recipeId={recipe.id} recipeTitle={recipe.title} />
      </CardHeader>
      <CardContent className="space-y-5">
        <RecipeTitleInput value={title} onChange={setTitle} />
        
        <RecipeDescriptionInput 
          value={description}
          onChange={setDescription}
          onGenerateAI={handleGenerateAIDescription}
          isGeneratingAI={isGeneratingAIDescription}
        />

        <MealTypeSelector value={category} onChange={setCategory} />

        <CuisineSelector value={cuisine} onChange={setCuisine} />

        <DietLifestyleSelector
          selectedValues={selectedDietLifestyle} 
          onChange={setSelectedDietLifestyle} 
        />

        <SaveButton 
          onClick={handleSave}
          disabled={isSaving || !title.trim()}
          isSaving={isSaving}
        />
      </CardContent>
    </Card>
  );
}
