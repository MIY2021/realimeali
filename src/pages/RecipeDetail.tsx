
import { useParams, Navigate } from "react-router-dom";
import { RecipeDetail as RecipeDetailComponent } from "@/components/recipes/RecipeDetail";
import { useRecipes } from "@/contexts/RecipesContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function RecipeDetail() {
  const { id, slug } = useParams();
  const { getRecipeById, getRecipeBySlug } = useRecipes();
  
  // Try to find recipe by slug first, then by ID (for backwards compatibility)
  let recipe;
  if (slug && !id) {
    // New URL format: /recipes/{slug}
    recipe = getRecipeBySlug(slug);
  } else if (id) {
    // Old URL format: /recipes/{id}/{slug} - find by ID
    recipe = getRecipeById(id);
    if (recipe) {
      // Redirect to new URL format
      const newSlug = recipe.title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      return <Navigate to={`/recipes/${newSlug}`} replace />;
    }
  }

  useDocumentTitle(recipe ? `${recipe.title} | RealiMeali` : "Recipe | RealiMeali");

  if (!recipe) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Recipe Not Found</h1>
          <p className="text-gray-600">The recipe you're looking for doesn't exist or may have been removed.</p>
        </div>
      </div>
    );
  }

  return <RecipeDetailComponent recipe={recipe} />;
}
