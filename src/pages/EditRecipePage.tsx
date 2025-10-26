import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { CreateRecipeContainer } from "@/components/recipes/create/CreateRecipeContainer";
import { Recipe } from "@/types";
import { generateSlug } from "@/utils/slugUtils";
import { useRecipeApi } from "@/hooks/useRecipeApi";

export default function EditRecipePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { recipes, getRecipeById, isLoading } = useRecipes();
  const { user } = useAuth();
  const { householdMembers } = useHousehold();
  const { fetchRecipeById } = useRecipeApi();
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [fullRecipe, setFullRecipe] = useState<Recipe | null>(null);
  const [isLoadingFullRecipe, setIsLoadingFullRecipe] = useState(false);

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

  // Find recipe by slug or legacy ID (lite version)
  const liteRecipe = (() => {
    if (!slug || isLoading) return undefined;
    
    // First try to find by slug (generated from title)
    const recipeBySlug = recipes.find(r => generateSlug(r.title) === slug);
    if (recipeBySlug) return recipeBySlug;
    
    // Fall back to legacy ID lookup (for backwards compatibility)
    return getRecipeById(slug);
  })();

  // Fetch full recipe details when lite recipe is found
  useEffect(() => {
    const loadFullRecipe = async () => {
      if (liteRecipe?.id && !fullRecipe) {
        setIsLoadingFullRecipe(true);
        try {
          const full = await fetchRecipeById(liteRecipe.id);
          setFullRecipe(full);
        } catch (error) {
          console.error("Failed to fetch full recipe:", error);
        } finally {
          setIsLoadingFullRecipe(false);
        }
      }
    };
    
    loadFullRecipe();
  }, [liteRecipe?.id, fullRecipe, fetchRecipeById]);

  useDocumentTitle(fullRecipe ? `Edit ${fullRecipe.title} | RealiMeali` : "Edit Recipe | RealiMeali");

  // Check if user is a member of the recipe's household (which allows editing)
  const canEdit = user && fullRecipe && householdMembers.some(member => 
    member.user_id === user.id && member.household_id === fullRecipe.household_id
  );

  // Show loading state while recipes are being fetched OR if we haven't attempted load yet OR loading full recipe
  if (isLoading || !hasAttemptedLoad || isLoadingFullRecipe) {
    return (
      <div className="container max-w-7xl py-4 px-4 sm:py-8 sm:px-6">
        <div className="space-y-6">
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // Only show "Recipe Not Found" after loading is complete AND we've attempted to load AND recipe is still not found
  if (!liteRecipe && hasAttemptedLoad) {
    return (
      <div className="container max-w-7xl py-4 px-4 sm:py-8 sm:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Recipe Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The recipe you're trying to edit doesn't exist or may have been deleted.
          </p>
          <Button onClick={() => navigate("/my-recipes")}>
            Back to Recipes
          </Button>
        </div>
      </div>
    );
  }

  // Check if user can edit this recipe
  if (fullRecipe && !canEdit) {
    return (
      <div className="container max-w-7xl py-4 px-4 sm:py-8 sm:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to edit this recipe.
          </p>
          <Button onClick={() => navigate("/my-recipes")}>
            Back to Recipes
          </Button>
        </div>
      </div>
    );
  }

  // If we're still loading or recipe isn't found yet, show loading
  if (!fullRecipe) {
    return (
      <div className="container max-w-7xl py-4 px-4 sm:py-8 sm:px-6">
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
      {/* Use the unified CreateRecipeContainer in edit mode */}
      <CreateRecipeContainer 
        editingRecipe={fullRecipe}
        isEditMode={true}
      />
    </div>
  );
}