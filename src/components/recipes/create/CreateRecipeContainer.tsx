import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus } from "lucide-react";
import { useRecipeForm } from "@/hooks/useRecipeForm";
import { useRecipeProcessing } from "@/hooks/useRecipeProcessing";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRealiChef } from "@/contexts/RealiChefContext";
import { CreateRecipeTabsWrapper } from "./CreateRecipeTabsWrapper";
import { useRecipeCreationHandlers, type RecipeOrigin } from "./hooks/useRecipeCreationHandlers";

export type { RecipeOrigin };

interface CreateRecipeContainerProps {
  editingRecipe?: any;
  isEditMode?: boolean;
}

export function CreateRecipeContainer({ editingRecipe, isEditMode = false }: CreateRecipeContainerProps) {
  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState(isEditMode ? "manual" : "url");
  const [recipeOrigin, setRecipeOrigin] = useState<RecipeOrigin>('manual');
  const [originalSourceUrl, setOriginalSourceUrl] = useState<string>('');
  const [manualTabClicked, setManualTabClicked] = useState(isEditMode);

  // Keep hooks as objects instead of destructuring
  const recipeFormHook = useRecipeForm(isEditMode, editingRecipe);
  const recipeProcessingHook = useRecipeProcessing();

  const { handleGenerateImage } = useImageGeneration();

  const { setIsOpen, updatePageContext, generateContextualWelcome } = useRealiChef();

  const handlers = useRecipeCreationHandlers({
    recipeFormHook,
    recipeProcessingHook,
    setRecipeOrigin,
    setOriginalSourceUrl,
    setActiveTab,
    recipeOrigin,
    originalSourceUrl,
    isEditMode,
    editingRecipe,
  });

  const onGenerateImage = () => {
    handleGenerateImage(
      recipeFormHook.newRecipe.title,
      recipeFormHook.setImagePreview,
      (url: string) => recipeFormHook.setNewRecipe({ ...recipeFormHook.newRecipe, image: url }),
      recipeFormHook.setIsGeneratingImage,
      recipeFormHook.setGenerationProgress,
      recipeFormHook.newRecipe.description,
      recipeFormHook.newRecipe.ingredients,
      recipeFormHook.newRecipe.instructions
    );
  };

  const handleRecipeUpdate = (updatedRecipe: any) => {
    // Update the recipe form with AI-suggested changes
    recipeFormHook.setNewRecipe(prev => ({
      ...prev,
      ...(updatedRecipe.title && { title: updatedRecipe.title }),
      ...(updatedRecipe.ingredients && { ingredients: updatedRecipe.ingredients }),
      ...(updatedRecipe.instructions && { instructions: updatedRecipe.instructions }),
      ...(updatedRecipe.servings && { servings: updatedRecipe.servings }),
      ...(updatedRecipe.prep_time && { prep_time: updatedRecipe.prep_time }),
      ...(updatedRecipe.cook_time && { cook_time: updatedRecipe.cook_time }),
      ...(updatedRecipe.meal_types && { meal_types: updatedRecipe.meal_types }),
      ...(updatedRecipe.cuisine_region && { cuisine_region: updatedRecipe.cuisine_region }),
      ...(updatedRecipe.complexity_level && { complexity_level: updatedRecipe.complexity_level }),
      ...(updatedRecipe.diet_lifestyle && { diet_lifestyle: updatedRecipe.diet_lifestyle })
    }));
  };

  const handleAskAIChef = () => {
    // Prepare current recipe data for AI context
    const recipeContext = {
      title: recipeFormHook.newRecipe.title || '',
      ingredients: recipeFormHook.newRecipe.ingredients || [],
      instructions: recipeFormHook.newRecipe.instructions || [],
      servings: recipeFormHook.newRecipe.servings || 1,
      prep_time: recipeFormHook.newRecipe.prep_time || 0,
      cook_time: recipeFormHook.newRecipe.cook_time || 0,
      meal_types: recipeFormHook.newRecipe.meal_types || [],
      cuisine_region: recipeFormHook.newRecipe.cuisine_region || '',
      complexity_level: recipeFormHook.newRecipe.complexity_level || '',
      diet_lifestyle: recipeFormHook.newRecipe.diet_lifestyle || []
    };

    // Update the page context with recipe data so AI can reference it
    updatePageContext({
      mode: 'recipe-edit',
      recipe: recipeContext,
      isEditMode,
      onRecipeUpdate: handleRecipeUpdate
    });

    // Open the AI chat first
    setIsOpen(true);
    
    // Generate contextual welcome message after a brief delay to ensure the chat is open
    setTimeout(() => {
      generateContextualWelcome();
    }, 100);
  };

  const handleTabChange = (tab: string) => {
    // Track if manual tab was clicked directly
    if (tab === 'manual') {
      setManualTabClicked(true);
    } else {
      setManualTabClicked(false);
    }

    if (tab === 'manual' && activeTab !== 'manual') {
      if (recipeOrigin === 'manual' && activeTab !== 'manual') {
        setRecipeOrigin(activeTab as RecipeOrigin);
        if (activeTab !== 'url') {
          recipeFormHook.setShareWithCommunity(false);
        }
      }
    } else if (tab !== 'manual') {
      if (activeTab === 'manual' && recipeOrigin === 'manual') {
        setRecipeOrigin('manual');
      }
      
      if (tab === 'url') {
        recipeFormHook.setShareWithCommunity(true);
      } else {
        recipeFormHook.setShareWithCommunity(false);
        setOriginalSourceUrl('');
      }
    }
    setActiveTab(tab);
  };

  // Pass manualTabClicked to determine whether to show dynamic tab name
  const effectiveRecipeOrigin = (activeTab === 'manual' && manualTabClicked) ? 'manual' : recipeOrigin;

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-start">
        <div className="space-y-2 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy flex items-center gap-2">
            <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-sage" />
            {isEditMode ? "Edit Recipe" : "Add New Recipe"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isEditMode 
              ? "Update your recipe with any changes. All your existing data is preserved and ready for editing."
              : "Turn your culinary imagination into reality! Whether you're recreating a family favorite or experimenting with new flavors, every great meal starts with the perfect recipe."
            }
          </p>
        </div>
        
        {/* Ask AI Chef Button - Only show in edit mode */}
        {isEditMode && (
          <div className="flex-shrink-0">
            <Button
              variant="outline"
              onClick={handleAskAIChef}
              className="flex items-center gap-2 text-sm"
            >
              <Sparkles className="h-4 w-4" />
              Ask AI Chef
            </Button>
          </div>
        )}
      </div>
      
      <CreateRecipeTabsWrapper
        isMobile={isMobile}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        recipeOrigin={effectiveRecipeOrigin}
        recipeFormHook={recipeFormHook}
        recipeProcessingHook={recipeProcessingHook}
        onProcessText={handlers.wrappedProcessText}
        onImportFromUrlWithImages={handlers.wrappedImportFromUrl}
        onProcessImage={handlers.wrappedProcessImage}
        onGenerateRecipe={handlers.wrappedGenerateRecipe}
        onGenerateImage={onGenerateImage}
        onSave={handlers.handleSaveRecipe}
        onCancel={handlers.handleCancel}
        isEditMode={isEditMode}
      />
    </div>
  );
}
