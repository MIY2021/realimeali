import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RecipeDetail as RecipeDetailComponent } from "@/components/recipes/RecipeDetail";
import { mockRecipes } from "@/data/recipes";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Recipe } from "@/types";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | undefined>(undefined);
  
  useEffect(() => {
    // In a real app, this would be an API call
    const foundRecipe = mockRecipes.find(r => r.id === id);
    setRecipe(foundRecipe);
  }, [id]);
  
  const handleToggleFavorite = (recipe: Recipe) => {
    // In a real app, this would be an API call
    setRecipe(prevRecipe => {
      if (!prevRecipe) return prevRecipe;
      return { ...prevRecipe, isFavorite: !prevRecipe.isFavorite };
    });
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
        onToggleFavorite={handleToggleFavorite}
        onAddToMealPlan={() => navigate("/meal-planner")}
      />
    </div>
  );
}
