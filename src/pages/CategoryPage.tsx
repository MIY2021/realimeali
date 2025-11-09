
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RecipeCard } from "@/components/recipes/RecipeCard";
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

  const decodedCategory = category ? decodeURIComponent(category) : "";
  
  useDocumentTitle(`${decodedCategory} Recipes | RealiMeali`);

  const filteredRecipes = recipes.filter(recipe => {
    // Check if the category matches any of the recipe's categories
    return (recipe.meal_types && recipe.meal_types.includes(decodedCategory as any)) ||
           recipe.meal_type === decodedCategory ||
           recipe.cuisine_region === decodedCategory ||
           // recipe.complexity_level removed
           (recipe.diet_lifestyle && recipe.diet_lifestyle.includes(decodedCategory as any));
  });

  const handleAddToMealPlan = (recipe: Recipe) => {
    // Navigate to recipe detail page where they can add to meal plan
    navigate(`/my-recipes/${recipe.id}`);
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
        <div className="mb-8">
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
        <h1 className="text-3xl font-bold text-navy">{decodedCategory} Recipes</h1>
        <span className="text-muted-foreground">({householdRecipes.length} recipe{householdRecipes.length !== 1 ? 's' : ''})</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {householdRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onAddToMealPlan={handleAddToMealPlan}
            showActions={true}
          />
        ))}
      </div>

    </div>
  );
}
