
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useToast } from "@/hooks/use-toast";
import { useRecipeForm } from "@/hooks/useRecipeForm";
import { useRecipeProcessing } from "@/hooks/useRecipeProcessing";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useIsMobile } from "@/hooks/use-mobile";
import { CreateRecipeTabsWrapper } from "./CreateRecipeTabsWrapper";
import { Plus } from "lucide-react";

export type RecipeOrigin = 'url' | 'image' | 'generate' | 'text' | 'manual';

export function CreateRecipeContainer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { createRecipe } = useRecipes();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState("url");
  const [isSaving, setIsSaving] = useState(false);
  const [recipeOrigin, setRecipeOrigin] = useState<RecipeOrigin>('manual');

  // Keep hooks as objects instead of destructuring
  const recipeFormHook = useRecipeForm();
  const recipeProcessingHook = useRecipeProcessing();

  const { handleGenerateImage } = useImageGeneration();

  const onGenerateImage = () => {
    handleGenerateImage(
      recipeFormHook.newRecipe.title,
      recipeFormHook.setImagePreview,
      (url: string) => recipeFormHook.setNewRecipe({ ...recipeFormHook.newRecipe, image: url }),
      recipeFormHook.setIsGeneratingImage,
      recipeFormHook.setGenerationProgress
    );
  };

  const handleSaveRecipe = async () => {
    if (!user || !currentHousehold) {
      toast({
        title: "Error",
        description: "You must be logged in and have a household to save recipes",
        variant: "destructive",
      });
      return;
    }

    if (!recipeFormHook.newRecipe.title.trim()) {
      toast({
        title: "Error",
        description: "Recipe title is required",
        variant: "destructive",
      });
      return;
    }

    if (recipeFormHook.newRecipe.ingredients.length === 0) {
      toast({
        title: "Error",
        description: "At least one ingredient is required",
        variant: "destructive",
      });
      return;
    }

    if (recipeFormHook.newRecipe.instructions.length === 0) {
      toast({
        title: "Error",
        description: "At least one instruction is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const recipeToSave = {
        ...recipeFormHook.newRecipe,
        household_id: currentHousehold.id,
      };

      const savedRecipe = await createRecipe(recipeToSave, currentHousehold.id);
      
      if (savedRecipe) {
        toast({
          title: "Success",
          description: "Recipe saved successfully!",
        });
        navigate("/my-recipes");
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast({
        title: "Error",
        description: "Failed to save recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/my-recipes");
  };

  // Wrapper functions to match expected signatures and track origin
  const wrappedProcessText = () => {
    setRecipeOrigin('text');
    return recipeProcessingHook.handleProcessText(recipeFormHook.setNewRecipe, recipeFormHook.newRecipe, setActiveTab);
  };
  
  const wrappedProcessImage = (file: File) => {
    setRecipeOrigin('image');
    return recipeProcessingHook.processImage(file, recipeFormHook.setNewRecipe, recipeFormHook.newRecipe, setActiveTab);
  };
  
  const wrappedGenerateRecipe = () => {
    setRecipeOrigin('generate');
    return recipeProcessingHook.generateRecipe(recipeFormHook.setNewRecipe, recipeFormHook.newRecipe, setActiveTab);
  };
  
  const wrappedImportFromUrl = () => {
    setRecipeOrigin('url');
    return recipeProcessingHook.handleImportFromUrl(recipeFormHook.setNewRecipe, recipeFormHook.newRecipe, setActiveTab);
  };

  // Handle when user manually switches to manual tab
  const handleTabChange = (tab: string) => {
    if (tab === 'manual' && activeTab !== 'manual') {
      // User is switching to manual tab - keep existing origin unless it was never set
      if (recipeOrigin === 'manual' && activeTab !== 'manual') {
        // This means they started elsewhere but we haven't tracked it yet
        setRecipeOrigin(activeTab as RecipeOrigin);
      }
    } else if (tab !== 'manual') {
      // User is switching to a different tab - reset origin to manual only if truly starting fresh
      if (activeTab === 'manual' && recipeOrigin === 'manual') {
        setRecipeOrigin('manual');
      }
    }
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy flex items-center gap-2">
            <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-sage" />
            Add New Recipe
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Turn your culinary imagination into reality! Whether you're recreating a family favorite or experimenting with new flavors, every great meal starts with the perfect recipe.
          </p>
        </div>
      </div>
      
      <CreateRecipeTabsWrapper
        isMobile={isMobile}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        recipeOrigin={recipeOrigin}
        recipeFormHook={recipeFormHook}
        recipeProcessingHook={recipeProcessingHook}
        onProcessText={wrappedProcessText}
        onImportFromUrlWithImages={wrappedImportFromUrl}
        onProcessImage={wrappedProcessImage}
        onGenerateRecipe={wrappedGenerateRecipe}
        onGenerateImage={onGenerateImage}
        onSave={handleSaveRecipe}
        onCancel={handleCancel}
      />
    </div>
  );
}
