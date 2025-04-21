
import { Recipe } from "@/types";
import { RecipeCard } from "./RecipeCard";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface RecipeListProps {
  recipes: Recipe[];
  onAddToMealPlan?: (recipe: Recipe) => void;
}

const SORTS = [
  { label: "Title (A-Z)", value: "title-asc" },
  { label: "Title (Z-A)", value: "title-desc" },
  { label: "Prep Time (Shortest)", value: "prep-asc" },
  { label: "Prep Time (Longest)", value: "prep-desc" },
  { label: "Cook Time (Shortest)", value: "cook-asc" },
  { label: "Cook Time (Longest)", value: "cook-desc" },
  { label: "Servings (Fewest)", value: "servings-asc" },
  { label: "Servings (Most)", value: "servings-desc" },
];

export function RecipeList({ recipes, onAddToMealPlan }: RecipeListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortType, setSortType] = useState<string>("title-asc");

  // Get all unique categories present in the recipes
  const allCategoriesSet = new Set<string>();
  recipes.forEach(recipe => recipe.categories.forEach(cat => allCategoriesSet.add(cat)));
  const allCategories = Array.from(allCategoriesSet);

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ||
      recipe.categories.includes(categoryFilter as any);

    return matchesSearch && matchesCategory;
  });

  // Sort recipes
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    switch (sortType) {
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
      case "prep-asc":
        return a.prepTime - b.prepTime;
      case "prep-desc":
        return b.prepTime - a.prepTime;
      case "cook-asc":
        return a.cookTime - b.cookTime;
      case "cook-desc":
        return b.cookTime - a.cookTime;
      case "servings-asc":
        return a.servings - b.servings;
      case "servings-desc":
        return b.servings - a.servings;
      default:
        return 0;
    }
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
        <div className="w-full sm:w-48 flex gap-2">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-2/3 border rounded p-2 flex-shrink"
          >
            <option value="all">All Categories</option>
            {allCategories.map((category) => (
              <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
            ))}
          </select>
          <select
            value={sortType}
            onChange={e => setSortType(e.target.value)}
            className="w-1/3 border rounded p-2 flex-shrink"
          >
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>
      {sortedRecipes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No recipes found. Try adjusting your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onAddToMealPlan={onAddToMealPlan} />
          ))}
        </div>
      )}
    </div>
  );
}
