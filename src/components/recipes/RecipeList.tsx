
import { Recipe } from "@/types";
import { RecipeCard } from "./RecipeCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useHouseholdShopping } from "@/contexts/HouseholdShoppingContext";
import { ChevronDown } from "lucide-react";
import { AddToMealPlanDialog } from "./AddToMealPlanDialog";

interface RecipeListProps {
  recipes: Recipe[];
}

export function RecipeList({ recipes }: RecipeListProps) {
  const { recipeCategories } = useHouseholdShopping();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortType, setSortType] = useState<string>("title-asc");
  const [displayCount, setDisplayCount] = useState(10);
  
  // State for meal plan dialog
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [mealPlanDialogOpen, setMealPlanDialogOpen] = useState(false);

  // Get categories from household context instead of hardcoded array
  const allCategories = recipeCategories.map(cat => cat.name);

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || 
                          recipe.categories.includes(categoryFilter as any);

    return matchesSearch && matchesCategory;
  });

  // Sort recipes
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    if (sortType === "title-asc") {
      return a.title.localeCompare(b.title);
    }
    if (sortType === "title-desc") {
      return b.title.localeCompare(a.title);
    }
    if (sortType === "prep-asc") {
      return a.prepTime - b.prepTime;
    }
    if (sortType === "prep-desc") {
      return b.prepTime - a.prepTime;
    }
    return 0;
  });

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 10);
  };

  const handleAddToMealPlan = (recipe: Recipe) => {
    console.log("Opening meal plan dialog for recipe:", recipe.title);
    setSelectedRecipe(recipe);
    setMealPlanDialogOpen(true);
  };

  const visibleRecipes = sortedRecipes.slice(0, displayCount);
  const hasMoreRecipes = displayCount < sortedRecipes.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-48 relative">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full border rounded p-2 pr-8 appearance-none bg-white"
          >
            <option value="all">All Categories</option>
            {allCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
        </div>
      </div>
      {sortedRecipes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No recipes found. Try adjusting your search.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleRecipes.map((recipe) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                onAddToMealPlan={() => handleAddToMealPlan(recipe)} 
              />
            ))}
          </div>
          
          {hasMoreRecipes && (
            <div className="flex justify-center mt-6">
              <Button onClick={handleLoadMore} variant="outline">
                Load More Recipes
              </Button>
            </div>
          )}
        </>
      )}

      <AddToMealPlanDialog
        recipe={selectedRecipe}
        open={mealPlanDialogOpen}
        onOpenChange={setMealPlanDialogOpen}
      />
    </div>
  );
}
