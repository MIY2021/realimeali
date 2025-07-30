import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Trash2 } from "lucide-react";
import { useRecipeForm } from "@/hooks/useRecipeForm";
import { useRecipeProcessing } from "@/hooks/useRecipeProcessing";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRealiChef } from "@/contexts/RealiChefContext";
import { useDraftRecipes } from "@/hooks/useDraftRecipes";
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
  const { hasDraft, hasUnsavedChanges, saveDraft, loadDraft, clearDraft, markSaved, checkForUnsavedChanges, draftInfo } = useDraftRecipes();

  const [activeTab, setActiveTab] = useState(
    defaultTab || (isEditMode ? "manual" : "url")
  );
  const [recipeOrigin, setRecipeOrigin] = useState<RecipeOrigin>('manual');
  const [originalSourceUrl, setOriginalSourceUrl] = useState<string>('');
  const [manualTabClicked, setManualTabClicked] = useState(isEditMode);

  // Keep hooks as objects instead of destructuring
  const recipeFormHook = useRecipeForm(isEditMode, editingRecipe);
  const recipeProcessingHook = useRecipeProcessing();

  const { handleGenerateImage } = useImageGeneration();

  const { setIsOpen, updatePageContext } = useRealiChef();

  // Load draft on mount (only for new recipes, not editing)
  useEffect(() => {
    if (!isEditMode && !editingRecipe && hasDraft) {
      const draft = loadDraft();
      if (draft) {
        // Convert draft to full Recipe object by adding missing fields
        const fullRecipe = {
          ...draft,
          id: '',
          created_at: '',
          updated_at: '',
          created_by: '',
        };
        recipeFormHook.setNewRecipe(fullRecipe);
        toast({
          title: "Draft Loaded",
          description: "Your previous recipe draft has been loaded.",
        });
      }
    }
  }, [isEditMode, editingRecipe, hasDraft, loadDraft, recipeFormHook, toast]);

  // Clear draft when starting a new recipe (only when not editing and no existing recipe data)
  useEffect(() => {
    if (!isEditMode && !editingRecipe && !recipeFormHook.newRecipe.title && !recipeFormHook.newRecipe.description) {
      clearDraft();
    }
  }, []);

  // Auto-save draft for manual entry tab only with debouncing
  useEffect(() => {
    if (!isEditMode && activeTab === "manual") {
      const timeoutId = setTimeout(() => {
        saveDraft(recipeFormHook.newRecipe);
      }, 3000); // Auto-save after 3 seconds of no changes

      return () => clearTimeout(timeoutId);
    }
  }, [recipeFormHook.newRecipe, activeTab, isEditMode, saveDraft]);

  // Check for unsaved changes
  useEffect(() => {
    if (!isEditMode && activeTab === "manual") {
      checkForUnsavedChanges(recipeFormHook.newRecipe);
    }
  }, [recipeFormHook.newRecipe, activeTab, isEditMode, checkForUnsavedChanges]);

  // Add beforeunload event listener for unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isEditMode) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isEditMode]);

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

  // Wrap the save handler to include draft clearing
  const wrappedSaveHandler = async () => {
    await handlers.handleSaveRecipe();
    markSaved(); // Clear draft after successful save
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
      complexity_level: selectedRecipe.complexity_level || 'beginner',
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

  const handleClearDraft = () => {
    clearDraft();
    // Reset form to empty state
    recipeFormHook.setNewRecipe({
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
      meal_types: [],
      cuisine_region: undefined,
      diet_lifestyle: [],
      complexity_level: undefined,
      image: undefined,
      is_favorite: false,
      has_cooked: false,
      household_id: '',
      created_at: '',
      updated_at: '',
      created_by: '',
    });
    toast({
      title: "Draft Cleared",
      description: "Your recipe draft has been cleared.",
    });
  };

  // Pass manualTabClicked to determine whether to show dynamic tab name
  const effectiveRecipeOrigin = (activeTab === 'manual' && manualTabClicked) ? 'manual' : recipeOrigin;
  
  // Check if this recipe is from AI
  const isFromAI = editingRecipe?.import_method === 'ai';

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
        
        {/* Action Buttons */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          {hasDraft && !isEditMode && draftInfo && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Draft saved at {draftInfo.formattedTime}</span>
              <button 
                onClick={handleClearDraft}
                className="text-muted-foreground hover:text-foreground underline"
              >
                Clear draft
              </button>
            </div>
          )}
          
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
