
import { useParams, Link } from "react-router-dom";
import { RecipeCategory } from "@/types";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useState } from "react";
import { AddToMealPlanDialog } from "@/components/recipes/AddToMealPlanDialog";
import { EditRecipeDialog } from "@/components/recipes/EditRecipeDialog";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types";

const isValidCategory = (cat: string): cat is RecipeCategory =>
  [
    "Bulk", "Easy", "Cheap", "Healthy", "Vegetarian", "Fish", "Super Tasty",
    "Pasta", "Tapas", "Winter", "BBQ", "Faffy", "Pricey!", "Not Yet Made",
    "Snacks", "Breakfast"
  ].includes(cat);

export default function CategoryPage() {
  const { category = "" } = useParams();
  const decoded = decodeURIComponent(category).trim();
  const { recipes, isLoading, updateRecipe, deleteRecipe } = useRecipes();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { toast } = useToast();
  
  // State for dialogs
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [mealPlanDialogOpen, setMealPlanDialogOpen] = useState(false);
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (!isValidCategory(decoded)) {
    return (
      <div className="container max-w-2xl py-6">
        <h1 className="text-2xl font-bold text-navy mb-4">Not found</h1>
        <p className="text-muted-foreground mb-2">No such category.</p>
        <Link to="/recipes" className="underline text-terracotta">Back to recipes</Link>
      </div>
    );
  }

  const filteredRecipes = recipes.filter(r => r.categories.includes(decoded as RecipeCategory));

  const handleAddToMealPlan = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setMealPlanDialogOpen(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditRecipe(recipe);
    setEditDialogOpen(true);
  };

  const handleDeleteRecipe = async (recipe: Recipe) => {
    if (!user || !currentHousehold) {
      toast({
        title: "Access Required",
        description: "You need to be logged in and part of a household to delete recipes.",
        variant: "destructive",
      });
      return;
    }

    // Allow deletion if user is part of the same household as the recipe
    if (recipe.householdId !== currentHousehold.id) {
      toast({
        title: "Permission Denied",
        description: "You can only delete recipes from your current household.",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete "${recipe.title}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      const success = await deleteRecipe(recipe.id);
      if (success) {
        toast({
          title: "Recipe Deleted",
          description: `"${recipe.title}" has been deleted successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShareRecipe = (recipe: Recipe) => {
    const recipeSlug = recipe.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    const recipeUrl = `${window.location.origin}/recipes/${recipeSlug}`;
    navigator.clipboard.writeText(recipeUrl).then(() => {
      toast({
        title: "Recipe Link Copied",
        description: "The recipe link has been copied to your clipboard.",
      });
    }).catch(() => {
      toast({
        title: "Share Failed",
        description: "Could not copy the recipe link.",
        variant: "destructive",
      });
    });
  };

  const handleSaveEdit = async (updatedRecipe: Recipe) => {
    if (!editRecipe) return;
    
    try {
      const result = await updateRecipe(editRecipe.id, updatedRecipe);
      if (result) {
        setEditDialogOpen(false);
        setEditRecipe(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="container max-w-4xl py-8">
        <h1 className="text-2xl font-bold text-navy mb-4">Category: {decoded}</h1>
        <p className="text-muted-foreground">Please log in to view your recipes in this category.</p>
        <Link to="/login" className="underline text-terracotta">Login here</Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 text-center">
        <p>Loading recipes...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-2xl font-bold text-navy mb-4">My Recipes: {decoded}</h1>
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">You don't have any recipes in this category yet.</p>
          <Link to="/recipes" className="underline text-terracotta">Create your first recipe</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe}
              onAddToMealPlan={() => handleAddToMealPlan(recipe)}
              onEdit={() => handleEditRecipe(recipe)}
              onDelete={() => handleDeleteRecipe(recipe)}
              onShare={() => handleShareRecipe(recipe)}
              showActions={true}
            />
          ))}
        </div>
      )}

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
    </div>
  );
}
