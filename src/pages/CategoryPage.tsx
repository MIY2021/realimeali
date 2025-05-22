
import { useParams, Link } from "react-router-dom";
import { RecipeCategory } from "@/types";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { useRecipes } from "@/contexts/RecipesContext";

const isValidCategory = (cat: string): cat is RecipeCategory =>
  [
    "Bulk", "Easy", "Cheap", "Healthy", "Vegetarian", "Fish", "Super Tasty",
    "Pasta", "Tapas", "Winter", "BBQ", "Faffy", "Pricey!", "Not Yet Made"
  ].includes(cat);

export default function CategoryPage() {
  const { category = "" } = useParams();
  const decoded = decodeURIComponent(category).trim();
  const { recipes, isLoading } = useRecipes();

  if (!isValidCategory(decoded)) {
    return (
      <div className="container max-w-2xl py-6">
        <h1 className="text-2xl font-bold text-navy mb-4">Not found</h1>
        <p className="text-muted-foreground mb-2">No such category.</p>
        <Link to="/recipes" className="underline text-terracotta">Back to recipes</Link>
      </div>
    );
  }

  const filteredRecipes = recipes.filter(r => r.categories.includes(decoded as RecipeCategory));

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 text-center">
        <p>Loading recipes...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-2xl font-bold text-navy mb-4">Recipes: {decoded}</h1>
      {filteredRecipes.length === 0 ? (
        <p className="text-muted-foreground">No recipes found in this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
