
import { useState, useMemo } from "react";
import { Recipe } from "@/types";

interface UseRecipeListProps {
  recipes: Recipe[];
}

export function useRecipeList({ recipes }: UseRecipeListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "prepTime" | "cookTime">("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [visibleCount, setVisibleCount] = useState(12);

  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = recipes;

    // Filter by search term
    if (searchTerm) {
      filtered = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort recipes
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case "title":
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        case "prepTime":
          valueA = a.prepTime;
          valueB = b.prepTime;
          break;
        case "cookTime":
          valueA = a.cookTime;
          valueB = b.cookTime;
          break;
        default:
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
      }

      if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [recipes, searchTerm, sortBy, sortOrder]);

  const visibleRecipes = filteredAndSortedRecipes.slice(0, visibleCount);
  const hasMoreRecipes = visibleCount < filteredAndSortedRecipes.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  return {
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredAndSortedRecipes,
    visibleRecipes,
    hasMoreRecipes,
    handleLoadMore,
  };
}
