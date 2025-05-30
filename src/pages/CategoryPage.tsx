
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { EditRecipeDialog } from "@/components/recipes/EditRecipeDialog";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Recipe } from "@/types";

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { recipes } = useRecipes();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const decodedCategory = category ? decodeURIComponent(category) : "";
  
  useDocumentTitle(`${decodedCategory} Recipes | RealiMeali`);

  const filteredRecipes = recipes.filter(recipe => {
    // Check if the category matches any of the recipe's categories
    return recipe.meal_type === decodedCategory ||
           recipe.cuisine_region === decodedCategory ||
           recipe.cooking_method === decodedCategory ||
           recipe.complexity_level === decodedCategory ||
           recipe.main_ingredient === decodedCategory ||
           (recipe.diet_lifestyle && recipe.diet_lifestyle.includes(decodedCategory as any));
  });

  const handleRecipeClick = (recipe: Recipe) => {
    navigate(`/my-recipes/${recipe.id}`);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsEditDialogOpen(true);
  };

  const handleRecipeUpdate = (updatedRecipe: Recipe) => {
    // This function is called when a recipe is updated
    // The RecipesContext will handle the actual update
    setEditingRecipe(null);
    setIsEditDialogOpen(false);
  };

  if (!user || !currentHousehold) {
    return (
      <div className="container max-w-7xl py-8 px-6">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in and select a household to view recipes.</p>
        </div>
      </div>
    );
  }

  if (filteredRecipes.filter(recipe => recipe.household_id === currentHousehold.id).length === 0) {
    return (
      <div className="container max-w-7xl py-8 px-6">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/my-recipes")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Recipes
          </Button>
          <h1 className="text-3xl font-bold text-navy">{decodedCategory} Recipes</h1>
        </div>
        
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes found</h3>
          <p className="text-gray-600 mb-6">
            You don't have any {decodedCategory.toLowerCase()} recipes yet.
          </p>
          <Button onClick={() => navigate("/my-recipes/new")}>
            Add Your First Recipe
          </Button>
        </div>
      </div>
    );
  }

  const householdRecipes = filteredRecipes.filter(recipe => recipe.household_id === currentHousehold.id);

  return (
    <div className="container max-w-7xl py-8 px-6">
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/my-recipes")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Recipes
        </Button>
        <h1 className="text-3xl font-bold text-navy">{decodedCategory} Recipes</h1>
        <span className="text-muted-foreground">({householdRecipes.length} recipe{householdRecipes.length !== 1 ? 's' : ''})</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {householdRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onClick={() => handleRecipeClick(recipe)}
            onEdit={() => handleEditRecipe(recipe)}
          />
        ))}
      </div>

      {editingRecipe && (
        <EditRecipeDialog
          recipe={editingRecipe}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onRecipeUpdate={handleRecipeUpdate}
        />
      )}
    </div>
  );
}
