
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  Clock, 
  Users, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Share, 
  Calendar,
  Lightbulb,
  BookOpen,
  ChefHat
} from "lucide-react";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { AddToMealPlanDialog } from "./AddToMealPlanDialog";
import { EditRecipeDialog } from "./EditRecipeDialog";
import { PublicRecipeSharing } from "./PublicRecipeSharing";
import { usePublicRecipeSharing } from "@/hooks/usePublicRecipeSharing";
import { useToast } from "@/hooks/use-toast";

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getRecipeById, toggleFavorite, deleteRecipe } = useRecipes();
  const { shareRecipe, isSharing } = usePublicRecipeSharing();
  const { toast } = useToast();

  const [showAddToMealPlan, setShowAddToMealPlan] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  if (!id) {
    navigate("/my-recipes");
    return null;
  }

  const recipe = getRecipeById(id);

  if (!recipe) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Recipe Not Found</h1>
          <p className="text-gray-600 mb-6">The recipe you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/my-recipes")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Recipes
          </Button>
        </div>
      </div>
    );
  }

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(recipe.id, !recipe.isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this recipe? This action cannot be undone.")) {
      try {
        const success = await deleteRecipe(recipe.id);
        if (success) {
          toast({
            title: "Success",
            description: "Recipe deleted successfully",
          });
          navigate("/my-recipes");
        }
      } catch (error) {
        console.error("Error deleting recipe:", error);
        toast({
          title: "Error",
          description: "Failed to delete recipe",
          variant: "destructive",
        });
      }
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = await shareRecipe(recipe, 30);
      if (shareUrl) {
        setShowShareDialog(true);
      }
    } catch (error) {
      console.error("Error sharing recipe:", error);
    }
  };

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const isOwner = user?.id === recipe.createdBy;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate("/my-recipes")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Recipes
        </Button>
        
        {isOwner && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Recipe Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{recipe.title}</h1>
          
          {recipe.description && (
            <p className="text-lg text-gray-600 mb-6">{recipe.description}</p>
          )}

          {/* Recipe Meta */}
          <div className="flex flex-wrap gap-4 mb-6">
            {recipe.prepTime > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                Prep: {recipe.prepTime}m
              </div>
            )}
            {recipe.cookTime > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                Cook: {recipe.cookTime}m
              </div>
            )}
            {totalTime > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                Total: {totalTime}m
              </div>
            )}
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-1" />
              {recipe.servings} servings
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button onClick={handleToggleFavorite} variant="outline">
              <Heart className={`h-4 w-4 mr-2 ${recipe.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              {recipe.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </Button>
            <Button onClick={() => setShowAddToMealPlan(true)} variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Add to Meal Plan
            </Button>
            <Button onClick={handleShare} variant="outline" disabled={isSharing}>
              <Share className="h-4 w-4 mr-2" />
              {isSharing ? 'Sharing...' : 'Share Recipe'}
            </Button>
          </div>
        </div>

        {/* Recipe Image */}
        <div className="lg:col-span-1">
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full h-64 lg:h-80 bg-gray-200 rounded-lg shadow-lg flex items-center justify-center">
              <ChefHat className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Top Tip */}
      {recipe.topTip && (
        <Card className="mb-8 bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">Chef's Tip</h3>
                <p className="text-yellow-700">{recipe.topTip}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recipe Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ingredients */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Ingredients
            </h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-sage rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-sage text-white text-sm font-medium rounded-full mr-3 flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AddToMealPlanDialog
        isOpen={showAddToMealPlan}
        onClose={() => setShowAddToMealPlan(false)}
        recipe={recipe}
      />

      <EditRecipeDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        recipe={recipe}
      />

      <PublicRecipeSharing
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        recipe={recipe}
      />
    </div>
  );
}
