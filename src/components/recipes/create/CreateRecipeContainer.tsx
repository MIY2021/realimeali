
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
import { supabase } from "@/integrations/supabase/client";

export function CreateRecipeContainer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { createRecipe } = useRecipes();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState("url");
  const [isSaving, setIsSaving] = useState(false);

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
        // Handle community submission if enabled
        if (recipeFormHook.shareWithCommunity) {
          await submitToCommunity(savedRecipe);
        }
        
        toast({
          title: "Success",
          description: "Recipe saved successfully!",
        });
        
        // Navigate to the detail page for the new recipe
        navigate(`/recipes/${savedRecipe.id}`);
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

  // Function to submit the recipe to community collection
  const submitToCommunity = async (recipe: any) => {
    try {
      // Prepare community recipe data
      const communityData = {
        title: recipe.title,
        description: recipe.description,
        source_url: recipeProcessingHook.recipeUrl || "",
        image_url: recipe.image,
        prep_time: recipe.prep_time,
        cook_time: recipe.cook_time,
        servings: recipe.servings,
        submitted_by: user?.id,
        submitted_by_name: user?.full_name || user?.email,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        cuisine: recipe.cuisine_region,
        category: recipe.meal_type,
        difficulty_level: recipe.complexity_level,
      };

      // Submit to community_recipes table
      const { data, error } = await supabase
        .from('community_recipes')
        .insert(communityData)
        .select();

      if (error) {
        console.error("Error submitting to community:", error);
        throw error;
      }

      toast({
        title: "Community Submission",
        description: "Your recipe was submitted to the community collection for review!",
      });
      
      return data;
    } catch (error) {
      console.error("Error submitting to community:", error);
      toast({
        title: "Community Submission Failed",
        description: "Your recipe was saved to your account, but we couldn't submit it to the community.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    navigate("/my-recipes");
  };

  // Wrapper functions to match expected signatures
  const wrappedProcessText = () => recipeProcessingHook.handleProcessText(recipeFormHook.setNewRecipe, recipeFormHook.newRecipe, setActiveTab);
  const wrappedProcessImage = (file: File) => recipeProcessingHook.handleProcessImage(file, recipeFormHook.setNewRecipe, recipeFormHook.newRecipe, setActiveTab);
  const wrappedGenerateRecipe = () => recipeProcessingHook.handleGenerateRecipe(recipeFormHook.setNewRecipe, recipeFormHook.newRecipe, setActiveTab);
  const wrappedImportFromUrl = () => recipeProcessingHook.handleImportFromUrl(recipeFormHook.setNewRecipe, recipeFormHook.newRecipe, setActiveTab);

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
        setActiveTab={setActiveTab}
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
