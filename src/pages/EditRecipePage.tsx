import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { CreateRecipeContainer } from "@/components/recipes/create/CreateRecipeContainer";
import { Recipe } from "@/types";
import { generateSlug } from "@/utils/slugUtils";

export default function EditRecipePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { recipes, getRecipeById, isLoading } = useRecipes();
  const { user } = useAuth();
  const { householdMembers } = useHousehold();
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  // Scroll to top when component mounts
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

  useDocumentTitle(recipe ? `Edit ${recipe.title} | RealiMeali` : "Edit Recipe | RealiMeali");

  // Check if user is a member of the recipe's household (which allows editing)
  const canEdit = user && recipe && householdMembers.some(member => 
    member.user_id === user.id && member.household_id === recipe.household_id
  );

  // Show loading state while recipes are being fetched OR if we haven't attempted load yet
  if (isLoading || !hasAttemptedLoad) {
    return (
      <div className="container max-w-7xl py-4 px-4 sm:py-8 sm:px-6">
        <div className="flex items-center justify-between mb-6">
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
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // Only show "Recipe Not Found" after loading is complete AND we've attempted to load AND recipe is still not found
  if (!recipe && hasAttemptedLoad) {
    return (
      <div className="container max-w-7xl py-4 px-4 sm:py-8 sm:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Recipe Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The recipe you're trying to edit doesn't exist or may have been deleted.
          </p>
          <Button onClick={() => navigate("/my-recipes")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </Button>
        </div>
      </div>
    );
  }

  // Check if user can edit this recipe
  if (recipe && !canEdit) {
    return (
      <div className="container max-w-7xl py-4 px-4 sm:py-8 sm:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to edit this recipe.
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
      <div className="container max-w-7xl py-4 px-4 sm:py-8 sm:px-6">
        <div className="flex items-center justify-between mb-6">
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
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-4 px-4 sm:py-8 sm:px-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            const slug = generateSlug(recipe.title);
            navigate(`/my-recipes/${slug}`);
          }}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Recipe
        </Button>
      </div>

      {/* Use the unified CreateRecipeContainer in edit mode */}
      <CreateRecipeContainer 
        editingRecipe={recipe}
        isEditMode={true}
      />
    </div>
  );
}