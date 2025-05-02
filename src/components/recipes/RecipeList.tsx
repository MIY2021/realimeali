
import { Recipe } from "@/types";
import { RecipeCard } from "./RecipeCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArrowDownAZ, ArrowUpAZ, Clock } from "lucide-react";
import { Select } from "@/components/ui/select";

interface RecipeListProps {
  recipes: Recipe[];
  onAddToMealPlan?: (recipe: Recipe) => void;
}

export function RecipeList({ recipes, onAddToMealPlan }: RecipeListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortType, setSortType] = useState<string>("title-asc");
  const [displayCount, setDisplayCount] = useState(10);

  // Get all unique categories present in the recipes
  const allCategoriesSet = new Set<string>();
  recipes.forEach(recipe => recipe.categories.forEach(cat => allCategoriesSet.add(cat)));
  const allCategories = Array.from(allCategoriesSet);

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
    if (sortType === "cook-asc") {
      return a.cookTime - b.cookTime;
    }
    if (sortType === "cook-desc") {
      return b.cookTime - a.cookTime;
    }
    if (sortType === "total-asc") {
      return (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime);
    }
    if (sortType === "total-desc") {
      return (b.prepTime + b.cookTime) - (a.prepTime + a.cookTime);
    }
    return 0;
  });

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 10);
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
        <div className="w-full sm:w-48">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="all">All Categories</option>
            {allCategories.map((category) => (
              <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 items-center justify-end">
        <span className="text-sm text-muted-foreground mr-2">Sort by:</span>
        <Button 
          variant={sortType.startsWith('title') ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setSortType(sortType === 'title-asc' ? 'title-desc' : 'title-asc')}
          className={sortType.startsWith('title') ? 'bg-terracotta text-white' : ''}
        >
          {sortType === 'title-desc' ? <ArrowDownAZ className="h-4 w-4 mr-1" /> : <ArrowUpAZ className="h-4 w-4 mr-1" />}
          Name
        </Button>
        <Button 
          variant={sortType.startsWith('prep') ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setSortType(sortType === 'prep-asc' ? 'prep-desc' : 'prep-asc')}
          className={sortType.startsWith('prep') ? 'bg-terracotta text-white' : ''}
        >
          <Clock className="h-4 w-4 mr-1" />
          Prep Time
        </Button>
        <Button 
          variant={sortType.startsWith('cook') ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setSortType(sortType === 'cook-asc' ? 'cook-desc' : 'cook-asc')}
          className={sortType.startsWith('cook') ? 'bg-terracotta text-white' : ''}
        >
          <Clock className="h-4 w-4 mr-1" />
          Cook Time
        </Button>
        <Button 
          variant={sortType.startsWith('total') ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setSortType(sortType === 'total-asc' ? 'total-desc' : 'total-asc')}
          className={sortType.startsWith('total') ? 'bg-terracotta text-white' : ''}
        >
          <Clock className="h-4 w-4 mr-1" />
          Total Time
        </Button>
      </div>
      
      {sortedRecipes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No recipes found. Try adjusting your search.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onAddToMealPlan={onAddToMealPlan} />
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
    </div>
  );
}
