import { useParams, Navigate } from "react-router-dom";
import { RecipeDetail as RecipeDetailComponent } from "@/components/recipes/RecipeDetail";
import { useRecipes } from "@/contexts/RecipesContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { AddToMealPlanDialog } from "@/components/recipes/AddToMealPlanDialog";
import { EditRecipeDialog } from "@/components/recipes/EditRecipeDialog";
import { Recipe } from "@/types";
import { useRecipesLoader } from "@/hooks/useRecipesLoader";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigationState } from "@/hooks/useNavigationState";

export default function RecipeDetail() {
  const { id, slug } = useParams();
  const { getRecipeById, getRecipeBySlug, updateRecipe, deleteRecipe } = useRecipes();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isLoading } = useRecipesLoader();
  const { markCameFromRecipes } = useNavigationState();
  
  // State for meal plan dialog
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [mealPlanDialogOpen, setMealPlanDialogOpen] = useState(false);
  
  // State for edit dialog
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  // Try to find recipe by slug first, then by ID (for backwards compatibility)
  let recipe;
  if (slug && !id) {
    // New URL format: /recipes/{slug}
    recipe = getRecipeBySlug(slug);
  } else if (id) {
    // Old URL format: /recipes/{id}/{slug} - find by ID
    recipe = getRecipeById(id);
    if (recipe) {
      // Redirect to new URL format
      const newSlug = recipe.title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      return <Navigate to={`/recipes/${newSlug}`} replace />;
    }
  }

  // Handle popstate event (browser back button)
  useEffect(() => {
    const handlePopState = () => {
      // Check if previous route was recipes page
      const previousRoute = sessionStorage.getItem('previousRoute');
      if (previousRoute === '/recipes') {
        sessionStorage.setItem('restoreRecipesScroll', 'true');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Mark that user came from recipes if referrer indicates so
  useEffect(() => {
    const referrer = document.referrer;
    if (referrer.includes('/recipes') && !referrer.includes('/recipes/')) {
      markCameFromRecipes();
    }
  }, [markCameFromRecipes]);

  // Scroll to top when recipe loads or changes
  useEffect(() => {
    if (recipe) {
      window.scrollTo(0, 0);
    }
  }, [recipe?.id]);

  useDocumentTitle(recipe ? `${recipe.title} | RealiMeali` : "Recipe | RealiMeali");

  const handleAddToMealPlan = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setMealPlanDialogOpen(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditRecipe(recipe);
    setEditDialogOpen(true);
  };

  const handleDeleteRecipe = async () => {
    if (!recipe || !user) return;

    try {
      const success = await deleteRecipe(recipe.id);
      if (success) {
        toast({
          title: "Recipe Deleted",
          description: `"${recipe.title}" has been deleted successfully.`,
        });
        // Navigate back to recipes page after deletion
        window.location.href = '/recipes';
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveEdit = async (updatedRecipe: Recipe) => {
    if (!editRecipe) return;
    
    try {
      await updateRecipe(editRecipe.id, updatedRecipe);
      setEditDialogOpen(false);
      setEditRecipe(null);
      toast({
        title: "Recipe Updated",
        description: "Recipe has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-4 sm:px-6 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <div className="lg:w-1/2">
              <Skeleton className="aspect-video w-full rounded-lg" />
            </div>
            <div className="lg:w-1/2 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-6">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="space-y-3 pt-2">
                <Skeleton className="h-10 w-full sm:w-40" />
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Skeleton className="h-10 w-full sm:w-32" />
                  <Skeleton className="h-10 w-full sm:w-24" />
                  <Skeleton className="h-10 w-full sm:w-28" />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show "Recipe Not Found" only after loading is complete and recipe still not found
  if (!recipe) {
    return (
      <div className="container max-w-4xl py-8 px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Recipe Not Found</h1>
          <p className="text-gray-600">The recipe you're looking for doesn't exist or may have been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <RecipeDetailComponent 
        recipe={recipe}
        onAddToMealPlan={handleAddToMealPlan}
        onEdit={handleEditRecipe}
        onDelete={handleDeleteRecipe}
        isOwner={user?.id === recipe.createdBy}
      />

      <AddToMealPlanDialog
        recipe={selectedRecipe}
        open={mealPlanDialogOpen}
        onOpenChange={setMealPlanDialogOpen}
      />

      {editRecipe && (
        <EditRecipeDialog
          recipe={editRecipe}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
}
