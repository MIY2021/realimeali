import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Trash2 } from "lucide-react";
import { useRecipeForm } from "@/hooks/useRecipeForm";
import { useRecipeProcessing } from "@/hooks/useRecipeProcessing";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRealiChef } from "@/contexts/RealiChefContext";

import { CreateRecipeTabsWrapper } from "./CreateRecipeTabsWrapper";
import { useRecipeCreationHandlers, type RecipeOrigin } from "./hooks/useRecipeCreationHandlers";
import { useToast } from "@/hooks/use-toast";

export type { RecipeOrigin };

interface CreateRecipeContainerProps {
  editingRecipe?: any;
  isEditMode?: boolean;
  defaultTab?: string;
}

export function CreateRecipeContainer({ editingRecipe, isEditMode = false, defaultTab }: CreateRecipeContainerProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  

  const [activeTab, setActiveTab] = useState(
    defaultTab || (isEditMode ? "manual" : "url")
  );
  const [recipeOrigin, setRecipeOrigin] = useState<RecipeOrigin>('manual');
  const [originalSourceUrl, setOriginalSourceUrl] = useState<string>('');
  const [manualTabClicked, setManualTabClicked] = useState(isEditMode);

  // Keep hooks as objects instead of destructuring
  const recipeFormHook = useRecipeForm(isEditMode, editingRecipe);
  const recipeProcessingHook = useRecipeProcessing();
  const recipeRef = useRef(recipeFormHook.newRecipe);

  const { handleGenerateImage } = useImageGeneration();

  const { setIsOpen, updatePageContext } = useRealiChef();


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

  // Simple save handler without draft clearing
  const wrappedSaveHandler = async () => {
    await handlers.handleSaveRecipe();
  };

  const onGenerateImage = () => {
    handleGenerateImage(
      recipeFormHook.newRecipe.title,
      recipeFormHook.setImagePreview,
      recipeFormHook.setImageFromUrl, // Use the dedicated image URL setter to preserve state
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
      // complexity_level removed
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
      // complexity_level removed
      diet_lifestyle: recipeFormHook.newRecipe.diet_lifestyle || []
    };

    const contextData = {
      mode: 'recipe-edit',
      recipe: recipeContext,
      isEditMode,
      onRecipeUpdate: handleRecipeUpdate
    };

    // Update the page context with recipe data so AI can reference it
    updatePageContext(contextData);

    // Open the AI chat (welcome message will be generated automatically)
    setIsOpen(true);
  };

  const handleSelectWhatCanIMakeRecipe = (selectedRecipe: any) => {
    console.log('Selected recipe from What Can I Make:', selectedRecipe);
    
    // Populate the form with the selected recipe
    recipeFormHook.setNewRecipe({
      ...recipeFormHook.newRecipe,
      title: selectedRecipe.title || '',
      description: selectedRecipe.description || '',
      ingredients: selectedRecipe.ingredients || [],
      instructions: selectedRecipe.instructions || [],
      prep_time: selectedRecipe.prep_time || 15,
      cook_time: selectedRecipe.cook_time || 30,
      servings: selectedRecipe.servings || 4,
      meal_type: selectedRecipe.meal_type || '',
      cuisine_region: selectedRecipe.cuisine_region || '',
      // complexity_level removed
      diet_lifestyle: selectedRecipe.diet_lifestyle || [],
    });

    // Switch to manual entry tab for editing
    setActiveTab('manual');
    setRecipeOrigin('whatcanImake');
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
      }
    } else if (tab !== 'manual') {
      if (activeTab === 'manual' && recipeOrigin === 'manual') {
        setRecipeOrigin('manual');
      }
      
      if (tab !== 'url') {
        setOriginalSourceUrl('');
      }
    }
    setActiveTab(tab);
  };


  // Pass manualTabClicked to determine whether to show dynamic tab name
  const effectiveRecipeOrigin = (activeTab === 'manual' && manualTabClicked) ? 'manual' : recipeOrigin;
  
  // Check if this recipe is from AI
  const isFromAI = editingRecipe?.import_method === 'ai';

  // Auto-import from URL if importUrl or url param is present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const importUrl = params.get('importUrl') || params.get('url');
    if (importUrl) {
      setActiveTab('url');
      recipeProcessingHook.setRecipeUrl(importUrl);
      // Don't auto-trigger import, just pre-fill the URL field
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      {/* Title Section */}
      <div className="flex flex-col gap-3 mb-4 sm:mb-6">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#1A1A1A] flex items-center gap-2">
              <Plus 
                className="h-6 w-6 sm:h-7 sm:w-7" 
                style={{ color: '#F5B82E', stroke: '#F5B82E' }}
                aria-hidden="true"
              />
              {isEditMode ? "Edit Recipe" : "Add New Recipe"}
            </h1>
            {/* Action Buttons */}
            {isEditMode && (
              <Button
                variant="outline"
                onClick={handleAskAIChef}
                className="flex items-center gap-2 text-sm"
              >
                <Sparkles className="h-4 w-4" />
                Ask AI Chef
              </Button>
            )}
          </div>
          <p className="text-sm text-[#6B6B6B] max-w-3xl">
            {isEditMode 
              ? "Update your recipe with any changes. All your existing data is preserved and ready for editing."
              : "Turn your culinary imagination into reality! Whether you're recreating a family favorite or experimenting with new flavors, every great meal starts with the perfect recipe."
            }
          </p>
        </div>
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
        onSave={wrappedSaveHandler}
        onCancel={handlers.handleCancel}
        isEditMode={isEditMode}
        isFromAI={isFromAI}
        onSelectWhatCanIMakeRecipe={handleSelectWhatCanIMakeRecipe}
      />
    </div>
  );
}
