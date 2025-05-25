
import { useParams, Navigate } from "react-router-dom";
import { RecipeDetail as RecipeDetailComponent } from "@/components/recipes/RecipeDetail";
import { useRecipes } from "@/contexts/RecipesContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { AddToMealPlanDialog } from "@/components/recipes/AddToMealPlanDialog";
import { EditRecipeDialog } from "@/components/recipes/EditRecipeDialog";
import { Recipe } from "@/types";

export default function RecipeDetail() {
  const { id, slug } = useParams();
  const { getRecipeById, getRecipeBySlug, updateRecipe, deleteRecipe } = useRecipes();
  const { user } = useAuth();
  const { toast } = useToast();
  
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
