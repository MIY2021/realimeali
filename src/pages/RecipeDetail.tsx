
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { RecipeDetail } from "@/components/recipes/RecipeDetail";
import { EditRecipeDialog } from "@/components/recipes/EditRecipeDialog";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Recipe } from "@/types";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getRecipeById, deleteRecipe } = useRecipes();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useDocumentTitle(recipe ? `${recipe.title} | RealiMeali` : "Recipe | RealiMeali");

  useEffect(() => {
    if (id) {
      const foundRecipe = getRecipeById(id);
      if (foundRecipe) {
        setRecipe(foundRecipe);
      } else {
        // Recipe not found, redirect to recipes page
        navigate("/recipes");
      }
    }
  }, [id, getRecipeById, navigate]);

  const handleEdit = (recipe: Recipe) => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!recipe) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteRecipe(recipe.id);
      if (success) {
        navigate("/recipes");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRecipeUpdate = (updatedRecipe: Recipe) => {
    setRecipe(updatedRecipe);
    setIsEditDialogOpen(false);
  };

  if (!recipe) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Recipe not found</p>
          <Button onClick={() => navigate("/recipes")} className="mt-4">
            Back to Recipes
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = user && recipe.createdBy === user.id;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/recipes")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Recipes
        </Button>
        
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add to Meal Plan
        </Button>
      </div>

      {/* Recipe Detail */}
      <RecipeDetail
        recipe={recipe}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isOwner={isOwner}
      />

      {/* Edit Dialog */}
      {isEditDialogOpen && (
        <EditRecipeDialog
          recipe={recipe}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onRecipeUpdate={handleRecipeUpdate}
        />
      )}
    </div>
  );
}
