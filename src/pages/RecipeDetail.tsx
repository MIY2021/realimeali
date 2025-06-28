import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useMetaTags } from "@/hooks/useMetaTags";
import { MetaTagUtils } from "@/utils/metaTagUtils";
import { RecipeDetail as RecipeDetailComponent } from "@/components/recipes/RecipeDetail";
import { EditRecipeDialog } from "@/components/recipes/EditRecipeDialog";
import { AddToMealPlanDialog } from "@/components/recipes/AddToMealPlanDialog";
import { Recipe } from "@/types";
import { generateSlug } from "@/utils/slugUtils";
import { useRealiChefContext } from "@/hooks/useRealiChefContext";

export default function RecipeDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { recipes, getRecipeById, updateRecipe, deleteRecipe, isLoading } = useRecipes();
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddToMealPlanOpen, setIsAddToMealPlanOpen] = useState(false);
  const [adjustedServings, setAdjustedServings] = useState<number | undefined>(undefined);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  // Scroll to top when component mounts or recipe changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Track when we've attempted to load recipes
  useEffect(() => {
    if (!isLoading) {
      setHasAttemptedLoad(true);
    }
  }, [isLoading]);

  // Find recipe by slug or legacy ID
  const recipe = (() => {
    if (!slug || isLoading) return undefined;
    
    // First try to find by slug (generated from title)
    const recipeBySlug = recipes.find(r => generateSlug(r.title) === slug);
    if (recipeBySlug) return recipeBySlug;
    
    // Fall back to legacy ID lookup (for backwards compatibility)
    return getRecipeById(slug);
  })();

  // Generate and apply meta tags when recipe is loaded
  useEffect(() => {
    if (recipe) {
      const metaTags = MetaTagUtils.generateRecipeMetaTags(recipe);
      // Apply meta tags through the hook
      // This will be handled by the useMetaTags hook below
    }
  }, [recipe]);

  // Apply meta tags
  const metaTags = recipe 
    ? MetaTagUtils.generateRecipeMetaTags(recipe)
    : { title: "Recipe | RealiMeali", description: "Loading recipe..." };
  
  useMetaTags(metaTags);

  // Update RealiChef context with recipe information
  useRealiChefContext({
    recipeTitle: recipe?.title,
    recipeMealType: recipe?.meal_type,
    recipeIngredients: recipe?.ingredients,
    servings: recipe?.servings
  });

  const handleEdit = (recipe: Recipe) => {
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

  const handleRecipeUpdate = async (updatedRecipe: Recipe) => {
    if (!recipe) return;
    
    try {
      const updated = await updateRecipe(recipe.id, updatedRecipe);
      if (updated) {
        setIsEditDialogOpen(false);
        // Force a refresh by navigating to the new slug if title changed
        const newSlug = generateSlug(updatedRecipe.title);
        const currentSlug = generateSlug(recipe.title);
        if (newSlug !== currentSlug) {
          navigate(`/my-recipes/${newSlug}`, { replace: true });
        }
      }
    } catch (error) {
      console.error('Error updating recipe:', error);
    }
  };

  const handleImageUpdate = async (imageUrl: string) => {
    if (!recipe) return;
    
    try {
      const updatedRecipe = { ...recipe, image: imageUrl };
      await updateRecipe(recipe.id, updatedRecipe);
    } catch (error) {
      console.error('Error updating recipe image:', error);
    }
  };

  const handleAddToMealPlan = (servings?: number) => {
    setAdjustedServings(servings);
    setIsAddToMealPlanOpen(true);
  };

  const canEdit = user && recipe && recipe.created_by === user.id;

  // Show loading state while recipes are being fetched OR if we haven't attempted load yet
  if (isLoading || !hasAttemptedLoad) {
    return (
      <div className="container max-w-4xl py-1 sm:py-4 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/my-recipes")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Recipes
          </Button>
        </div>
        
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  // Only show "Recipe Not Found" after loading is complete AND we've attempted to load AND recipe is still not found
  if (!recipe && hasAttemptedLoad) {
    return (
      <div className="container max-w-4xl py-2 sm:py-4 px-4 sm:px-6">
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

  // If we're still loading or recipe isn't found yet, show loading
  if (!recipe) {
    return (
      <div className="container max-w-4xl py-1 sm:py-4 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/my-recipes")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Recipes
          </Button>
        </div>
        
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-1 sm:py-4 px-4 sm:px-6">
      {/* Header with back button only */}
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/my-recipes")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Recipes
        </Button>
      </div>

      {recipe && (
        <>
          {/* Use the elegant RecipeDetail component */}
          <RecipeDetailComponent
            recipe={recipe}
            onEdit={canEdit ? handleEdit : undefined}
            onDelete={canEdit ? handleDelete : undefined}
            isOwner={canEdit}
            onAddToMealPlan={handleAddToMealPlan}
            onImageUpdate={canEdit ? handleImageUpdate : undefined}
          />

          {/* Dialogs */}
          {isEditDialogOpen && recipe && (
            <EditRecipeDialog
              recipe={recipe}
              open={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
              onRecipeUpdate={handleRecipeUpdate}
            />
          )}

          {isAddToMealPlanOpen && recipe && (
            <AddToMealPlanDialog
              recipe={recipe}
              open={isAddToMealPlanOpen}
              onOpenChange={setIsAddToMealPlanOpen}
              adjustedServings={adjustedServings}
            />
          )}
        </>
      )}
    </div>
  );
}
