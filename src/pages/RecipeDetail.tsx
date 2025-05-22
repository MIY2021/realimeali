
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RecipeDetail as RecipeDetailComponent } from "@/components/recipes/RecipeDetail";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Recipe } from "@/types";
import { EditRecipeDialog } from "@/components/recipes/EditRecipeDialog";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecipeById, isLoading } = useRecipes();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const recipe = id ? getRecipeById(id) : undefined;
  
  const handleEdit = (recipe: Recipe) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to log in to edit recipes.",
        variant: "destructive",
      });
      return;
    }
    setShowEditDialog(true);
  };

  const handleUpdateRecipe = (updatedRecipe: Recipe) => {
    // In a real app, we would update this in Supabase
    // For now, just close the dialog
    setShowEditDialog(false);
    
    toast({
      title: "Recipe Updated",
      description: `${updatedRecipe.title} has been updated.`
    });
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
        onAddToMealPlan={() => navigate("/meal-planner")}
        onEdit={() => handleEdit(recipe)}
      />

      {recipe && (
        <EditRecipeDialog 
          recipe={recipe} 
          open={showEditDialog} 
          onOpenChange={setShowEditDialog}
          onSave={handleUpdateRecipe}
        />
      )}
    </div>
  );
}
