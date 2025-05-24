
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RecipeDetail as RecipeDetailComponent } from "@/components/recipes/RecipeDetail";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Recipe } from "@/types";
import { EditRecipeDialog } from "@/components/recipes/EditRecipeDialog";
import { AddToMealPlanDialog } from "@/components/recipes/AddToMealPlanDialog";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecipeById, isLoading, updateRecipe, deleteRecipe } = useRecipes();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMealPlanDialog, setShowMealPlanDialog] = useState(false);
  
  const recipe = id ? getRecipeById(id) : undefined;

  // Redirect to clean URL if recipe is found and URL doesn't match expected format
  useEffect(() => {
    if (recipe) {
      const createSlug = (title: string) => {
        return title
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
      };
      
      const expectedSlug = createSlug(recipe.title);
      const currentPath = window.location.pathname;
      const expectedPath = `/recipes/${recipe.id}/${expectedSlug}`;
      
      if (currentPath !== expectedPath) {
        navigate(expectedPath, { replace: true });
      }
    }
  }, [recipe, navigate]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const handleEdit = (recipe: Recipe) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to log in to edit recipes.",
        variant: "destructive",
      });
      return;
    }

    if (recipe.createdBy !== user.id) {
      toast({
        title: "Permission Denied",
        description: "You can only edit your own recipes.",
        variant: "destructive",
      });
      return;
    }

    setShowEditDialog(true);
  };

  const handleUpdateRecipe = async (updatedRecipe: Recipe) => {
    if (!recipe) return;
    
    const result = await updateRecipe(recipe.id, updatedRecipe);
    if (result) {
      setShowEditDialog(false);
    }
  };

  const handleDeleteRecipe = async () => {
    if (!recipe || !user) return;

    if (recipe.createdBy !== user.id) {
      toast({
        title: "Permission Denied",
        description: "You can only delete your own recipes.",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this recipe? This action cannot be undone.");
    if (!confirmed) return;

    const success = await deleteRecipe(recipe.id);
    if (success) {
      navigate("/recipes");
    }
  };

  const handleAddToMealPlan = (recipe: Recipe) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to log in to add recipes to your meal plan.",
        variant: "destructive",
      });
      return;
    }
    console.log("Opening meal plan dialog for recipe:", recipe.title);
    setShowMealPlanDialog(true);
  };
  
  if (isLoading) {
    return (
      <div className="container py-8 text-center">
        <p>Loading recipe...</p>
      </div>
    );
  }
  
  if (!recipe) {
    return (
      <div className="container py-8 text-center">
        <p>Recipe not found</p>
        <Button onClick={() => navigate("/recipes")} className="mt-4">
          Back to Recipes
        </Button>
      </div>
    );
  }

  const isOwner = user && recipe.createdBy === user.id;
  
  return (
    <div className="container">
      <Button 
        variant="ghost" 
        className="mt-4 mb-2"
        onClick={() => navigate("/recipes")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Recipes
      </Button>
      
      <RecipeDetailComponent 
        recipe={recipe} 
        onAddToMealPlan={() => handleAddToMealPlan(recipe)}
        onEdit={() => handleEdit(recipe)}
        onDelete={isOwner ? handleDeleteRecipe : undefined}
        isOwner={isOwner}
      />

      {recipe && (
        <EditRecipeDialog 
          recipe={recipe} 
          open={showEditDialog} 
          onOpenChange={setShowEditDialog}
          onSave={handleUpdateRecipe}
        />
      )}

      <AddToMealPlanDialog
        recipe={recipe}
        open={showMealPlanDialog}
        onOpenChange={setShowMealPlanDialog}
      />
    </div>
  );
}
