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
import { Recipe } from "@/types";
import { IngredientSectionParser } from "@/utils/ingredientSectionParser";

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
  const [originalSourceUrl, setOriginalSourceUrl] = useState<string>('');
  const [manualTabClicked, setManualTabClicked] = useState(false);

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
      recipeFormHook.setGenerationProgress,
      recipeFormHook.newRecipe.description,
      recipeFormHook.newRecipe.ingredients,
      recipeFormHook.newRecipe.instructions
    );
  };

  const prepareIngredientsForSave = (ingredients: string[]): string[] => {
    // Preserve ALL ingredients including section headers, but filter out empty ones
    return ingredients.filter(ingredient => ingredient && ingredient.trim().length > 0);
  };

  const validateRecipe = () => {
    const errors: string[] = [];
    
    // Prepare ingredients for validation (preserve headers but filter empty)
    const validIngredients = prepareIngredientsForSave(recipeFormHook.newRecipe.ingredients || []);
    
    // Count only actual ingredients (not headers) for validation
    const sections = IngredientSectionParser.parseIngredients(validIngredients);
    const actualIngredients = sections.reduce((count, section) => count + section.ingredients.length, 0);
    
    console.log('🔍 Validating recipe:', {
      title: recipeFormHook.newRecipe.title,
      totalItems: validIngredients.length,
      actualIngredients: actualIngredients,
      sections: sections.length,
      instructions: recipeFormHook.newRecipe.instructions?.length || 0,
      prep_time: recipeFormHook.newRecipe.prep_time,
      cook_time: recipeFormHook.newRecipe.cook_time,
      servings: recipeFormHook.newRecipe.servings,
      image: recipeFormHook.newRecipe.image ? 'has image' : 'no image'
    });
    
    if (!recipeFormHook.newRecipe.title?.trim()) {
      errors.push("Recipe title is required");
    }
    
    if (actualIngredients === 0) {
      errors.push("At least one ingredient is required");
    }
    
    if (!recipeFormHook.newRecipe.instructions || recipeFormHook.newRecipe.instructions.length === 0) {
      errors.push("At least one instruction is required");
    }
    
    if (!recipeFormHook.newRecipe.prep_time || recipeFormHook.newRecipe.prep_time <= 0) {
      errors.push("Prep time must be greater than 0 minutes");
    }
    
    if (recipeFormHook.newRecipe.cook_time === undefined || recipeFormHook.newRecipe.cook_time < 0) {
      errors.push("Cook time must be 0 or greater");
    }
    
    if (!recipeFormHook.newRecipe.servings || recipeFormHook.newRecipe.servings <= 0) {
      errors.push("Servings must be greater than 0");
    }

    console.log('🔍 Validation errors:', errors);
    return errors;
  };

  const handleSaveRecipe = async () => {
    console.log('💾 Starting save recipe process...');
    
    if (!user || !currentHousehold) {
      console.error('❌ Missing authentication:', { user: !!user, household: !!currentHousehold });
      toast({
        title: "Authentication Required",
        description: "You must be logged in and have a household to save recipes.",
        variant: "destructive",
      });
      return;
    }

    // Validate the recipe
    const validationErrors = validateRecipe();
    if (validationErrors.length > 0) {
      console.error('❌ Validation failed:', validationErrors);
      toast({
        title: "Recipe Incomplete",
        description: `Please fix the following issues: ${validationErrors.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      console.log('💾 Preparing recipe data for save...');
      
      // Preserve ALL ingredients including headers - just filter empty ones
      const preservedIngredients = prepareIngredientsForSave(recipeFormHook.newRecipe.ingredients || []);
      
      // Clean the recipe data
      const recipeToSave = {
        ...recipeFormHook.newRecipe,
        title: recipeFormHook.newRecipe.title?.trim() || '',
        description: recipeFormHook.newRecipe.description?.trim() || '',
        top_tip: recipeFormHook.newRecipe.top_tip?.trim() || "Enjoy cooking this delicious recipe!",
        ingredients: preservedIngredients, // Keep headers AND ingredients
        instructions: recipeFormHook.newRecipe.instructions?.filter(inst => inst?.trim()) || [],
        diet_lifestyle: recipeFormHook.newRecipe.diet_lifestyle || [],
        prep_time: Math.max(0, recipeFormHook.newRecipe.prep_time || 0),
        cook_time: Math.max(0, recipeFormHook.newRecipe.cook_time || 0),
        servings: Math.max(1, recipeFormHook.newRecipe.servings || 1),
        household_id: currentHousehold.id,
      };

      console.log('💾 Final recipe data to save:', {
        ...recipeToSave,
        image: recipeToSave.image ? 'has image data' : 'no image',
        ingredientsCount: recipeToSave.ingredients.length,
        hasHeaders: recipeToSave.ingredients.some(ing => ing.endsWith(':'))
      });

      const savedRecipe = await createRecipe(recipeToSave, currentHousehold.id);
      
      if (savedRecipe) {
        console.log('✅ Recipe saved successfully:', savedRecipe.id);
        
        // Handle community sharing if enabled and is from URL import
        const effectiveShareWithCommunity = recipeOrigin === 'url' ? recipeFormHook.shareWithCommunity : false;
        
        if (effectiveShareWithCommunity) {
          console.log("🌍 Community sharing enabled, submitting to community_recipes...");
          
          try {
            const communityRecipeData = {
              title: savedRecipe.title,
              description: savedRecipe.description || `A delicious ${savedRecipe.meal_type || 'recipe'} recipe with ${savedRecipe.ingredients.length} ingredients.`,
              source_url: originalSourceUrl || `${window.location.origin}/my-recipes/${savedRecipe.id}`,
              image_url: savedRecipe.image,
              prep_time: savedRecipe.prep_time,
              cook_time: savedRecipe.cook_time,
              servings: savedRecipe.servings,
              category: savedRecipe.meal_type || null,
              cuisine: savedRecipe.cuisine_region || null,
              difficulty_level: recipeToSave.complexity_level === 'quick_easy' ? 'Easy' : 
                             recipeToSave.complexity_level === 'complex' ? 'Hard' : 'Standard',
              submitted_by: user.id,
              submitted_by_name: user.email || 'Anonymous',
              is_approved: false,
              is_active: true,
              moderation_status: 'pending'
            };

            const { data: communityRecipe, error: communityError } = await supabase
              .from('community_recipes')
              .insert(communityRecipeData)
              .select()
              .single();

            if (communityError) {
              console.error("❌ Community submission error:", communityError);
              toast({
                title: "Recipe Saved Successfully! 🎉",
                description: `${savedRecipe.title} has been saved to your recipes. Community sharing failed but your recipe is safely saved.`,
              });
            } else {
              console.log("✅ Recipe successfully submitted to community:", communityRecipe);
              toast({
                title: "Recipe Saved & Shared! 🌟",
                description: `${savedRecipe.title} has been saved and submitted to the community for moderation.`,
              });
            }
          } catch (communityError) {
            console.error("❌ Community submission failed:", communityError);
            toast({
              title: "Recipe Saved Successfully! 🎉",
              description: `${savedRecipe.title} has been saved to your recipes. Community sharing failed but your recipe is safely saved.`,
            });
          }
        } else {
          console.log("🎉 Recipe saved successfully, no community sharing");
          toast({
            title: "Recipe Saved Successfully! 🎉",
            description: `${savedRecipe.title} has been added to your recipe collection.`,
          });
        }
        
        // Navigate to recipes page and scroll to top
        navigate("/my-recipes");
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else {
        throw new Error('Recipe creation returned null');
      }
    } catch (error) {
      console.error("❌ Error saving recipe:", error);
      let errorMessage = "Failed to save recipe. Please try again.";
      
      if (error instanceof Error) {
        console.error("❌ Error details:", error.message);
        if (error.message.includes('Network')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes('duplicate')) {
          errorMessage = "A recipe with this title already exists. Please use a different title.";
        } else if (error.message.includes('unauthorized')) {
          errorMessage = "You don't have permission to save recipes. Please check your household membership.";
        }
      }
      
      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/my-recipes");
  };

  const wrappedProcessText = () => {
    setRecipeOrigin('text');
    setOriginalSourceUrl('');
    recipeFormHook.setShareWithCommunity(false);
    return recipeProcessingHook.handleProcessText(
      (recipe) => recipeFormHook.setNewRecipe(prev => ({ ...prev, ...recipe })), 
      recipeFormHook.newRecipe, 
      setActiveTab
    );
  };
  
  const wrappedProcessImage = async (file: File) => {
    setRecipeOrigin('image');
    setOriginalSourceUrl('');
    recipeFormHook.setShareWithCommunity(false);
    const result = await recipeProcessingHook.processImage(file);
    if (result) {
      // Set source_url and import_method for image imports
      const processedRecipe = {
        ...result,
        source_url: null, // No source URL for image imports
        import_method: 'image' as const
      };
      recipeFormHook.setNewRecipe(prev => ({ ...prev, ...processedRecipe }));
      setActiveTab("manual");
    }
  };
  
  const wrappedGenerateRecipe = async () => {
    setRecipeOrigin('generate');
    setOriginalSourceUrl('');
    recipeFormHook.setShareWithCommunity(false);
    const result = await recipeProcessingHook.generateRecipe({});
    if (result) {
      recipeFormHook.setNewRecipe(prev => ({ ...prev, ...result }));
      setActiveTab("manual");
    }
  };
  
  const wrappedImportFromUrl = () => {
    setRecipeOrigin('url');
    setOriginalSourceUrl(recipeProcessingHook.recipeUrl);
    recipeFormHook.setShareWithCommunity(true);
    return recipeProcessingHook.handleImportFromUrl(
      (recipe) => recipeFormHook.setNewRecipe(prev => ({ ...prev, ...recipe })), 
      recipeFormHook.newRecipe, 
      setActiveTab,
      recipeFormHook.setShareWithCommunity
    );
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
        recipeOrigin={effectiveRecipeOrigin}
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
