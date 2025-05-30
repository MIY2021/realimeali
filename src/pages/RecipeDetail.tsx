
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Share, Trash2 } from "lucide-react";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { EditRecipeDialog } from "@/components/recipes/EditRecipeDialog";
import { AddToMealPlanDialog } from "@/components/recipes/AddToMealPlanDialog";
import { Recipe } from "@/types";

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecipeById, deleteRecipe, toggleFavorite } = useRecipes();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddToMealPlanOpen, setIsAddToMealPlanOpen] = useState(false);

  const recipe = id ? getRecipeById(id) : undefined;

  useDocumentTitle(recipe ? `${recipe.title} | RealiMeali` : "Recipe | RealiMeali");

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!recipe) return;
    
    const confirmed = window.confirm("Are you sure you want to delete this recipe?");
    if (confirmed) {
      const success = await deleteRecipe(recipe.id);
      if (success) {
        navigate("/my-recipes");
      }
    }
  };

  const handleToggleFavorite = async () => {
    if (!recipe) return;
    await toggleFavorite(recipe.id, !recipe.is_favorite);
  };

  const handleRecipeUpdate = (updatedRecipe: Recipe) => {
    setIsEditDialogOpen(false);
  };

  const canEdit = user && recipe && recipe.created_by === user.id;

  if (!recipe) {
    return (
      <div className="container max-w-4xl py-8 px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Recipe Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The recipe you're looking for doesn't exist or may have been deleted.
          </p>
          <Button onClick={() => navigate("/my-recipes")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 px-6">
      <div className="flex items-center justify-between mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/my-recipes")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Recipes
        </Button>
        
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-navy mb-2">{recipe.title}</h1>
            {recipe.description && (
              <p className="text-muted-foreground text-lg">{recipe.description}</p>
            )}
          </div>

          {recipe.image && (
            <div className="rounded-lg overflow-hidden">
              <img 
                src={recipe.image} 
                alt={recipe.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-navy">{recipe.prep_time}</div>
              <div className="text-sm text-muted-foreground">Prep Time</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-navy">{recipe.cook_time}</div>
              <div className="text-sm text-muted-foreground">Cook Time</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-navy">{recipe.servings}</div>
              <div className="text-sm text-muted-foreground">Servings</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <Button 
                variant="ghost" 
                onClick={handleToggleFavorite}
                className="h-auto p-0 text-2xl"
              >
                {recipe.is_favorite ? "❤️" : "🤍"}
              </Button>
              <div className="text-sm text-muted-foreground">Favorite</div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-navy font-medium">•</span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-navy text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="pt-1">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          {recipe.top_tip && (
            <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Top Tip</h3>
              <p className="text-blue-800">{recipe.top_tip}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Button 
            onClick={() => setIsAddToMealPlanOpen(true)}
            className="w-full"
          >
            Add to Meal Plan
          </Button>
          
          {/* Recipe meta information */}
          <div className="space-y-2 text-sm text-muted-foreground">
            {recipe.meal_type && (
              <div><strong>Meal Type:</strong> {recipe.meal_type}</div>
            )}
            {recipe.cuisine_region && (
              <div><strong>Cuisine:</strong> {recipe.cuisine_region}</div>
            )}
            {recipe.complexity_level && (
              <div><strong>Difficulty:</strong> {recipe.complexity_level}</div>
            )}
            {recipe.diet_lifestyle && recipe.diet_lifestyle.length > 0 && (
              <div><strong>Diet:</strong> {recipe.diet_lifestyle.join(", ")}</div>
            )}
          </div>
        </div>
      </div>

      {isEditDialogOpen && (
        <EditRecipeDialog
          recipe={recipe}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onRecipeUpdate={handleRecipeUpdate}
        />
      )}

      {isAddToMealPlanOpen && (
        <AddToMealPlanDialog
          recipe={recipe}
          open={isAddToMealPlanOpen}
          onOpenChange={setIsAddToMealPlanOpen}
        />
      )}
    </div>
  );
}
