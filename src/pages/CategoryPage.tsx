
import { useParams, Link } from "react-router-dom";
import { RecipeCategory } from "@/types";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";

const isValidCategory = (cat: string): cat is RecipeCategory =>
  [
    "Bulk", "Easy", "Cheap", "Healthy", "Vegetarian", "Fish", "Super Tasty",
    "Pasta", "Tapas", "Winter", "BBQ", "Faffy", "Pricey!", "Not Yet Made",
    "Snacks", "Breakfast"
  ].includes(cat);

export default function CategoryPage() {
  const { category = "" } = useParams();
  const decoded = decodeURIComponent(category).trim();
  const { recipes, isLoading } = useRecipes();
  const { user } = useAuth();

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

  if (!user) {
    return (
      <div className="container max-w-4xl py-8">
        <h1 className="text-2xl font-bold text-navy mb-4">Category: {decoded}</h1>
        <p className="text-muted-foreground">Please log in to view your recipes in this category.</p>
        <Link to="/login" className="underline text-terracotta">Login here</Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 text-center">
        <p>Loading recipes...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-2xl font-bold text-navy mb-4">My Recipes: {decoded}</h1>
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">You don't have any recipes in this category yet.</p>
          <Link to="/recipes" className="underline text-terracotta">Create your first recipe</Link>
        </div>
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
