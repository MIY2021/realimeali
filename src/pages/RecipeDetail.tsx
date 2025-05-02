
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RecipeDetailComponent from "@/components/recipes/RecipeDetail";
import { mockRecipes } from "@/data/recipes";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Recipe } from "@/types";
import { EditRecipeDialog } from "@/components/recipes/EditRecipeDialog";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | undefined>(undefined);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  useEffect(() => {
    // In a real app, this would be an API call
    const foundRecipe = mockRecipes.find(r => r.id === id);
    setRecipe(foundRecipe);
  }, [id]);
  
  const handleEdit = (recipe: Recipe) => {
    setShowEditDialog(true);
  };

  const handleUpdateRecipe = (updatedRecipe: Recipe) => {
    setRecipe(updatedRecipe);
    setShowEditDialog(false);
  };
  
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
        onEdit={handleEdit}
      />

      {recipe && (
        <EditRecipeDialog 
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onSave={handleUpdateRecipe}
          onDelete={() => {}}
          recipe={recipe}
        />
      )}
    </div>
  );
}
