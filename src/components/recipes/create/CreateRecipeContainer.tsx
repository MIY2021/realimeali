import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Check } from "lucide-react";
import { useRecipeForm } from "@/hooks/useRecipeForm";
import { useRecipeProcessing } from "@/hooks/useRecipeProcessing";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRealiChef } from "@/contexts/RealiChefContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { RealiChefIcon, RecipeCardIcon } from "@/components/icons/RealiMealiIcons";

import { CreateRecipeTabsWrapper } from "./CreateRecipeTabsWrapper";
import { useRecipeCreationHandlers, type RecipeOrigin } from "./hooks/useRecipeCreationHandlers";
import { useToast } from "@/hooks/use-toast";
import { useMealPlan } from "@/contexts/MealPlanContext";

export type { RecipeOrigin };

interface CreateRecipeContainerProps {
  editingRecipe?: any;
  isEditMode?: boolean;
  defaultTab?: string;
  customMealContext?: { mealPlanId: string; title: string; servings: number; mealType: string };
}

export function CreateRecipeContainer({ editingRecipe, isEditMode = false, defaultTab, customMealContext }: CreateRecipeContainerProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { replaceFreetypedMealPlan } = useMealPlan();
  const [savedCustomRecipe, setSavedCustomRecipe] = useState<any>(null);
  const [isReplacingCustomMeal, setIsReplacingCustomMeal] = useState(false);
  

  const [activeTab, setActiveTab] = useState(
    defaultTab || (isEditMode ? "manual" : "")
  );
  const [recipeOrigin, setRecipeOrigin] = useState<RecipeOrigin>('manual');
  const [originalSourceUrl, setOriginalSourceUrl] = useState<string>('');
  const [manualTabClicked, setManualTabClicked] = useState(isEditMode);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Keep hooks as objects instead of destructuring
  const recipeFormHook = useRecipeForm(isEditMode, editingRecipe);
  const recipeProcessingHook = useRecipeProcessing();
  const recipeRef = useRef(recipeFormHook.newRecipe);

  const { handleGenerateImage } = useImageGeneration();

  const { setIsOpen, updatePageContext } = useRealiChef();


  const handleCustomMealSaved = async (savedRecipe: any) => {
    setSavedCustomRecipe(savedRecipe);
  };

  const handleReplaceCustomMeal = async () => {
    if (!customMealContext || !savedCustomRecipe) return;
    setIsReplacingCustomMeal(true);
    try {
      await replaceFreetypedMealPlan(customMealContext.mealPlanId, savedCustomRecipe.id, customMealContext.servings);
      toast({
        title: "Meal plan updated",
        description: savedCustomRecipe.title + " has replaced " + customMealContext.title + ".",
      });
      navigate("/meal-planner");
    } catch (error) {
      toast({
        title: "Couldn't replace meal",
        description: "The recipe was saved, but the custom meal could not be replaced.",
        variant: "destructive",
      });
    } finally {
      setIsReplacingCustomMeal(false);
    }
  };

  const handleKeepCustomMeal = () => {
    navigate("/my-recipes");
  };

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
    customMealPlanId: customMealContext?.mealPlanId,
    onCustomMealSaved: handleCustomMealSaved,
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

  const handleCardClick = (tab: string) => {
    setActiveTab(tab);
    // Set recipe origin when clicking manual tab
    if (tab === 'manual') {
      setRecipeOrigin('manual');
      setManualTabClicked(true);
    }
    setIsSheetOpen(true);
  };

  const handleSheetClose = (open: boolean) => {
    setIsSheetOpen(open);
    // If closing and we're on manual tab with imported content, keep it
    // Otherwise, reset to show cards
    if (!open && activeTab === 'manual' && recipeOrigin === 'manual' && !isEditMode) {
      setActiveTab('');
    }
  };

  // Close Sheet when switching to manual tab after import
  useEffect(() => {
    if (activeTab === 'manual' && recipeOrigin !== 'manual' && isSheetOpen) {
      setIsSheetOpen(false);
    }
  }, [activeTab, recipeOrigin, isSheetOpen]);


  // Pass manualTabClicked to determine whether to show dynamic tab name
  const effectiveRecipeOrigin = (activeTab === 'manual' && manualTabClicked) ? 'manual' : recipeOrigin;
  
  // Check if this recipe is from AI
  const isFromAI = editingRecipe?.import_method === 'ai';

  // Check if recipe has been parsed/processed (has title or ingredients)
  const hasRecipeBeenParsed = !isEditMode && (
    (recipeFormHook.newRecipe.title && recipeFormHook.newRecipe.title.trim().length > 0) ||
    (recipeFormHook.newRecipe.ingredients && recipeFormHook.newRecipe.ingredients.length > 0)
  );

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
    <div className="space-y-4">      {savedCustomRecipe && customMealContext ? (
        <div className="rounded-xl border border-[#B85F49]/20 bg-[#FFF9F6] p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Check className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-gray-900">Recipe saved!</h2>
              <p className="mt-1 text-sm text-gray-600">
                Would you like to replace <strong>{customMealContext.title}</strong> in your meal plan with <strong>{savedCustomRecipe.title}</strong>?
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button onClick={handleReplaceCustomMeal} disabled={isReplacingCustomMeal} className="bg-[#B85F49] hover:bg-[#A65340] text-white">
                  {isReplacingCustomMeal ? "Replacing..." : "Replace Custom Meal"}
                </Button>
                <Button onClick={handleKeepCustomMeal} variant="outline">
                  Keep Custom Meal
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}


      {/* Title Section */}
      <PageHeader
        icon={
          <RecipeCardIcon 
            className="h-6 w-6 sm:h-7 sm:w-7 text-[#B85F49]" 
            aria-hidden="true"
          />
        }
        title={isEditMode ? "Edit Recipe" : "Add New Recipe"}
        actions={isEditMode ? (
          <Button
            variant="outline"
            onClick={handleAskAIChef}
            className="flex items-center gap-2 text-sm"
          >
            <RealiChefIcon className="h-4 w-4" />
            Ask AI Chef
          </Button>
        ) : undefined}
      />
      
      {!savedCustomRecipe && <CreateRecipeTabsWrapper
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
        isSaving={handlers.isSaving}
        onCardClick={handleCardClick}
        isSheetOpen={isSheetOpen}
        onSheetClose={handleSheetClose}
      />}
    </div>
  );
}
