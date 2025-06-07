
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";
import { SingleRecipeModerationView } from "./moderation/SingleRecipeModerationView";
import { ModerationNavigation } from "./moderation/ModerationNavigation";
import { useRecipeModerationOperations } from "./moderation/useRecipeModerationOperations";

export function RecipeModerationPanel() {
  const [allRecipes, setAllRecipes] = useState<CommunityRecipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<CommunityRecipe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentFilter, setCurrentFilter] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecipes = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("🔍 Fetching all recipes for moderation...");
      
      const { data, error } = await supabase
        .from('community_recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("❌ Error fetching recipes:", error);
        throw error;
      }

      console.log("📊 Fetched recipes:", data?.length || 0);
      setAllRecipes((data || []) as CommunityRecipe[]);
      
    } catch (error) {
      console.error('❌ Error fetching recipes:', error);
      toast.error("Failed to load recipes");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { 
    generateAIImage,
    uploadImageFile,
    updateAIImageUrl,
    updateRecipeFields,
    generateAIDescription,
    approveRecipe,
    rejectRecipe,
    generatingAI,
    uploadingFile,
    savingFields
  } = useRecipeModerationOperations(fetchRecipes);

  // Enhanced approve function that handles navigation
  const handleApproveRecipe = async (recipeId: string) => {
    const currentRecipeIndex = currentIndex;
    console.log("✅ Approving recipe at index:", currentRecipeIndex, "Recipe ID:", recipeId);
    await approveRecipe(recipeId);
    
    // After approval, navigate to next pending recipe or stay in bounds
    setTimeout(() => {
      if (currentFilter === 'pending' && filteredRecipes.length > 1) {
        // If we're on the last item, go to previous, otherwise stay at same index
        if (currentRecipeIndex >= filteredRecipes.length - 1) {
          setCurrentIndex(Math.max(0, currentRecipeIndex - 1));
        }
        // If we're not on the last item, the index will naturally point to the next recipe
      }
    }, 100); // Small delay to ensure data is refreshed
  };

  // Enhanced reject function that handles navigation
  const handleRejectRecipe = async (recipeId: string) => {
    const currentRecipeIndex = currentIndex;
    console.log("❌ Rejecting recipe at index:", currentRecipeIndex, "Recipe ID:", recipeId);
    await rejectRecipe(recipeId);
    
    // After rejection, navigate to next pending recipe or stay in bounds
    setTimeout(() => {
      if (currentFilter === 'pending' && filteredRecipes.length > 1) {
        // If we're on the last item, go to previous, otherwise stay at same index
        if (currentRecipeIndex >= filteredRecipes.length - 1) {
          setCurrentIndex(Math.max(0, currentRecipeIndex - 1));
        }
        // If we're not on the last item, the index will naturally point to the next recipe
      }
    }, 100); // Small delay to ensure data is refreshed
  };

  // Wrapper function to match the expected signature
  const handleSaveFields = (recipe: CommunityRecipe, updates: Partial<CommunityRecipe>) => {
    updateRecipeFields(recipe.id, updates);
  };

  // Filter recipes based on current filter
  useEffect(() => {
    let filtered: CommunityRecipe[] = [];
    
    switch (currentFilter) {
      case 'pending':
        filtered = allRecipes.filter(r => 
          r.moderation_status === 'pending' || 
          r.moderation_status === 'in_review' || 
          !r.moderation_status
        );
        break;
      case 'approved':
        filtered = allRecipes.filter(r => r.moderation_status === 'approved');
        break;
      case 'rejected':
        filtered = allRecipes.filter(r => r.moderation_status === 'rejected');
        break;
      default:
        filtered = allRecipes;
    }
    
    console.log("🔄 Filtering recipes:", currentFilter, "Found:", filtered.length);
    setFilteredRecipes(filtered);
    
    // Ensure currentIndex is within bounds
    if (filtered.length > 0) {
      const newIndex = Math.min(currentIndex, filtered.length - 1);
      if (newIndex !== currentIndex) {
        console.log("📍 Adjusting current index from", currentIndex, "to", newIndex);
        setCurrentIndex(newIndex);
      }
    } else {
      setCurrentIndex(0);
    }
  }, [allRecipes, currentFilter, currentIndex]);

  // Keyboard navigation (no auto-approval logic)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (filteredRecipes.length === 0) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          if (currentIndex > 0) {
            console.log("⬅️ Navigate left to index:", currentIndex - 1);
            setCurrentIndex(currentIndex - 1);
          }
          break;
        case 'ArrowRight':
          if (currentIndex < filteredRecipes.length - 1) {
            console.log("➡️ Navigate right to index:", currentIndex + 1);
            setCurrentIndex(currentIndex + 1);
          }
          break;
        case 'a':
        case 'A':
          if (event.ctrlKey || event.metaKey) return; // Don't interfere with Ctrl+A
          event.preventDefault();
          const currentRecipe = filteredRecipes[currentIndex];
          if (currentRecipe && currentRecipe.ai_generated_image_url) {
            handleApproveRecipe(currentRecipe.id);
          }
          break;
        case 'r':
        case 'R':
          if (event.ctrlKey || event.metaKey) return; // Don't interfere with Ctrl+R
          event.preventDefault();
          const currentRecipeToReject = filteredRecipes[currentIndex];
          if (currentRecipeToReject) {
            handleRejectRecipe(currentRecipeToReject.id);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, filteredRecipes]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta"></div>
      </div>
    );
  }

  const currentRecipe = filteredRecipes[currentIndex];

  console.log("🎯 Current recipe display:", {
    index: currentIndex,
    total: filteredRecipes.length,
    recipeId: currentRecipe?.id,
    recipeTitle: currentRecipe?.title
  });

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <ModerationNavigation
        currentIndex={currentIndex}
        totalCount={filteredRecipes.length}
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        onNavigate={setCurrentIndex}
        recipes={allRecipes}
      />

      {/* Main Content */}
      {filteredRecipes.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No {currentFilter} recipes
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentFilter === 'pending' 
                  ? "All recipes have been reviewed!" 
                  : `No ${currentFilter} recipes found.`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : currentRecipe ? (
        <SingleRecipeModerationView
          key={`recipe-${currentRecipe.id}`}
          recipe={currentRecipe}
          onApprove={handleApproveRecipe}
          onReject={handleRejectRecipe}
          onGenerateAI={generateAIImage}
          onUploadFile={uploadImageFile}
          onUpdateImageUrl={updateAIImageUrl}
          onSaveFields={handleSaveFields}
          onGenerateAIDescription={generateAIDescription}
          generatingAI={generatingAI}
          uploadingFile={uploadingFile}
          savingFields={savingFields}
        />
      ) : null}
    </div>
  );
}
