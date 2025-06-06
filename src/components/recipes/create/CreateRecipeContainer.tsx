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
      recipeFormHook.setGenerationProgress, // Use the actual setter function
      recipeFormHook.newRecipe.description
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
    
    // For image imports, disable community sharing as there's no source URL
    const effectiveShareWithCommunity = recipeOrigin === 'image' ? false : recipeFormHook.shareWithCommunity;
    
    // Log the shareWithCommunity flag for debugging
    console.log("🔄 Saving recipe with shareWithCommunity:", effectiveShareWithCommunity, "origin:", recipeOrigin);
    
    try {
      const recipeToSave = {
        ...recipeFormHook.newRecipe,
        household_id: currentHousehold.id,
      };

      const savedRecipe = await createRecipe(recipeToSave, currentHousehold.id);
      
      if (savedRecipe) {
        // Handle community sharing if enabled and not from image import
        if (effectiveShareWithCommunity) {
          console.log("🌍 Community sharing enabled, submitting to community_recipes...");
          
          try {
            const communityRecipeData = {
              title: savedRecipe.title,
              description: savedRecipe.description || `A delicious ${savedRecipe.meal_type || 'recipe'} recipe with ${savedRecipe.ingredients.length} ingredients.`,
              source_url: `${window.location.origin}/my-recipes/${savedRecipe.id}`,
              image_url: savedRecipe.image,
              prep_time: savedRecipe.prep_time,
              cook_time: savedRecipe.cook_time,
              servings: savedRecipe.servings,
              category: savedRecipe.meal_type || null,
              cuisine: savedRecipe.cuisine_region || null,
              difficulty_level: savedRecipe.complexity_level === 'quick_easy' ? 'Easy' : 
                             savedRecipe.complexity_level === 'complex' ? 'Hard' : 'Standard',
              submitted_by: user.id,
              submitted_by_name: user.email || 'Anonymous',
              is_approved: false,
              is_active: true,
              moderation_status: 'pending'
            };

            console.log("📝 Submitting community recipe data:", communityRecipeData);

            const { data: communityRecipe, error: communityError } = await supabase
              .from('community_recipes')
              .insert(communityRecipeData)
              .select()
              .single();

            if (communityError) {
              console.error("❌ Community submission error:", communityError);
              toast({
                title: "Recipe saved!",
                description: `${savedRecipe.title} has been saved. Community sharing failed but recipe is saved.`,
              });
            } else {
              console.log("✅ Recipe successfully submitted to community:", communityRecipe);
              toast({
                title: "Recipe saved and submitted!",
                description: `${savedRecipe.title} has been saved and submitted to the community for moderation.`,
              });
            }
          } catch (communityError) {
            console.error("❌ Community submission failed:", communityError);
            toast({
              title: "Recipe saved!",
              description: `${savedRecipe.title} has been saved. Community sharing failed but recipe is saved.`,
            });
          }
        } else {
          if (recipeOrigin === 'image') {
            console.log("🎉 Recipe saved successfully, community sharing disabled for image import");
            toast({
              title: "Success",
              description: "Recipe saved successfully! Community sharing is disabled for photo imports.",
            });
          } else {
            console.log("🎉 Recipe saved successfully, no community sharing requested");
            toast({
              title: "Success",
              description: "Recipe saved successfully!",
            });
          }
        }
        
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
    return recipeProcessingHook.handleProcessText(
      (recipe) => recipeFormHook.setNewRecipe(prev => ({ ...prev, ...recipe })), 
      recipeFormHook.newRecipe, 
      setActiveTab
    );
  };
  
  const wrappedProcessImage = async (file: File) => {
    setRecipeOrigin('image');
    // Disable community sharing for image imports
    recipeFormHook.setShareWithCommunity(false);
    const result = await recipeProcessingHook.processImage(file);
    if (result) {
      recipeFormHook.setNewRecipe(prev => ({ ...prev, ...result }));
      setActiveTab("manual");
    }
  };
  
  const wrappedGenerateRecipe = async () => {
    setRecipeOrigin('generate');
    const result = await recipeProcessingHook.generateRecipe({});
    if (result) {
      recipeFormHook.setNewRecipe(prev => ({ ...prev, ...result }));
      setActiveTab("manual");
    }
  };
  
  const wrappedImportFromUrl = () => {
    setRecipeOrigin('url');
    return recipeProcessingHook.handleImportFromUrl(
      (recipe) => recipeFormHook.setNewRecipe(prev => ({ ...prev, ...recipe })), 
      recipeFormHook.newRecipe, 
      setActiveTab,
      recipeFormHook.setShareWithCommunity // Pass the function to enable default sharing
    );
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
