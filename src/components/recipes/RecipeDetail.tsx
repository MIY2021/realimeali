import { Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Pencil, Share, Users, Trash2, ArrowLeft, Sparkles } from "lucide-react";
import { RecipeImage } from "@/components/ui/recipe-image";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePublicRecipeSharing } from "@/hooks/usePublicRecipeSharing";
import { useState } from "react";
import { format } from "date-fns";
import { useNavigate, useLocation } from "react-router-dom";
import { useNavigationState } from "@/hooks/useNavigationState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface RecipeDetailProps {
  recipe: Recipe;
  onAddToMealPlan?: (recipe: Recipe) => void;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: () => void;
  isOwner?: boolean;
}

export function RecipeDetail({ recipe, onAddToMealPlan, onEdit, onDelete, isOwner }: RecipeDetailProps) {
  const { user } = useAuth();
  const { profile } = useUserProfile(recipe.createdBy);
  const { createPublicShare, isCreatingShare } = usePublicRecipeSharing();
  const navigate = useNavigate();
  const location = useLocation();
  const { navigationState } = useNavigationState();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { 
    title, 
    description, 
    ingredients, 
    instructions, 
    prepTime, 
    cookTime, 
    servings, 
    categories,
    topTip,
    createdAt
  } = recipe;

  const handleBackToRecipes = () => {
    console.log('Back button clicked, navigation state:', navigationState);
    console.log('Location state:', location.state);
    
    // Check if user came from shopping list
    const fromShoppingList = location.state?.fromShoppingList === true;
    const returnToShoppingList = sessionStorage.getItem('returnToShoppingList') === 'true';
    const previousRoute = sessionStorage.getItem('previousRoute');
    
    if (fromShoppingList || returnToShoppingList || previousRoute === '/shopping-list') {
      // User came from shopping list, restore their scroll position
      console.log('Navigating back to shopping list with scroll restoration');
      sessionStorage.setItem('restoreShoppingListScroll', 'true');
      sessionStorage.removeItem('returnToShoppingList');
      sessionStorage.removeItem('previousRoute');
      navigate('/shopping-list', { 
        state: { 
          restoreScroll: true,
          scrollPosition: location.state?.scrollPosition 
        } 
      });
    } else if (navigationState.cameFromRecipes || navigationState.shouldRestoreScroll) {
      // User came from recipes page, restore their scroll position
      console.log('Navigating back with scroll restoration');
      sessionStorage.setItem('restoreRecipesScroll', 'true');
      navigate('/my-recipes', { state: { restoreScroll: true } });
    } else {
      // User entered directly (bookmark, share, etc.), go to top of recipes
      console.log('Navigating back to top of recipes');
      navigate('/my-recipes');
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(recipe);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!user) {
      toast.error("Login Required", {
        description: "You need to log in to delete recipes.",
      });
      return;
    }

    if (onDelete) {
      try {
        await onDelete();
        setDeleteDialogOpen(false);
        
        // Show success notification
        toast.success("Recipe deleted successfully", {
          description: `"${recipe.title}" has been removed from your collection.`,
        });
        
        // Navigate back to my recipes page
        navigate('/my-recipes');
      } catch (error) {
        console.error('Error deleting recipe:', error);
        toast.error("Failed to delete recipe", {
          description: "Please try again later.",
        });
      }
    }
  };

  const handleShare = async () => {
    if (!user) {
      toast.error("Login Required", {
        description: "You need to log in to share recipes.",
      });
      return;
    }

    const shareUrl = await createPublicShare(recipe);
    if (!shareUrl) return;

    const shareData = {
      title: `${recipe.title} | RealiMeali`,
      text: `Check out this delicious recipe: ${recipe.title}`,
      url: shareUrl,
    };

    try {
      // Try native sharing first (mobile devices)
      if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        await navigator.share(shareData);
        return;
      }
    } catch (error) {
      console.log("Native sharing failed, falling back to clipboard");
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied!", {
        description: "The recipe share link has been copied to your clipboard.",
      });
    } catch (error) {
      toast.error("Share failed", {
        description: "Failed to copy link to clipboard.",
      });
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-4 sm:px-6 sm:py-8">
      <div className="space-y-6 sm:space-y-8">
        {/* Back to Recipes Button */}
        <div className="flex items-center">
          <Button
            variant="outline"
            onClick={handleBackToRecipes}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to {location.state?.fromShoppingList || sessionStorage.getItem('returnToShoppingList') === 'true' ? 'Shopping List' : 'Recipes'}</span>
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="lg:w-1/2">
            <div className="aspect-video overflow-hidden rounded-lg">
              <RecipeImage recipe={recipe} className="h-full w-full" iconSize="h-16 w-16" />
            </div>
          </div>
          
          <div className="lg:w-1/2 space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-navy">{recipe.title}</h1>
            <div className="flex flex-wrap gap-2">
              {recipe.categories.map((category) => (
                <span 
                  key={category} 
                  className="inline-flex items-center rounded-full bg-sage/20 px-2.5 py-1 text-xs font-medium text-sage"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
              ))}
            </div>
            <p className="text-muted-foreground">{recipe.description}</p>
            
            {/* Recipe Stats */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-6 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-terracotta" />
                <span>Prep: {recipe.prepTime} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-terracotta" />
                <span>Cook: {recipe.cookTime} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-terracotta" />
                <span>Total: {recipe.prepTime + recipe.cookTime} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-terracotta" />
                <span>Serves: {recipe.servings}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 w-full sm:w-auto"
                onClick={() => onAddToMealPlan?.(recipe)}
              >
                <CalendarDays className="h-4 w-4" />
                <span>Add to Meal Plan</span>
              </Button>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {user && (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 w-full sm:w-auto"
                    onClick={handleEdit}
                  >
                    <Pencil className="h-4 w-4" />
                    <span>Edit Recipe</span>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 w-full sm:w-auto"
                  onClick={handleShare}
                  disabled={isCreatingShare}
                >
                  <Share className="h-4 w-4" />
                  <span>{isCreatingShare ? 'Creating Link...' : 'Share'}</span>
                </Button>
                {user && (
                  <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 text-destructive hover:text-destructive w-full sm:w-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{recipe.title}"? This action cannot be undone and the recipe will be permanently removed from your collection.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteConfirm}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Recipe
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-navy">Ingredients</h2>
            <ul className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 block h-2 w-2 rounded-full bg-terracotta flex-shrink-0" />
                  <span className="text-sm sm:text-base">{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-navy">Instructions</h2>
            <ol className="space-y-4">
              {instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage text-white text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-sm sm:text-base">{instruction}</span>
                </li>
              ))}
            </ol>

            {/* Top Tip Section */}
            {topTip && (
              <div className="mt-8 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">💡 Top Tip</h3>
                    <p className="text-yellow-700 text-sm sm:text-base leading-relaxed">
                      {topTip}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recipe Attribution Footer */}
        <div className="border-t pt-6 mt-8">
          <div className="text-sm text-muted-foreground">
            <p>
              Recipe added by {profile?.full_name || 'Unknown user'} on{' '}
              {format(new Date(createdAt), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
