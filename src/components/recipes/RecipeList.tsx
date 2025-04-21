
import { Recipe } from "@/types";
import { RecipeCard } from "./RecipeCard";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface RecipeListProps {
  recipes: Recipe[];
}

export function RecipeList({ recipes }: RecipeListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

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
          <div className="relative">
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
      </div>
      
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No recipes found. Try adjusting your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
