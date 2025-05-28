
import { useState, useCallback, useMemo } from "react";
import { Recipe } from "@/types";

interface UseRecipeListProps {
  recipes: Recipe[];
}

export function useRecipeList({ recipes }: UseRecipeListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortType, setSortType] = useState<string>("date-newest");
  const [displayCount, setDisplayCount] = useState(12);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           recipe.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === "all" || 
                            recipe.categories.includes(categoryFilter as any);

      return matchesSearch && matchesCategory;
    });
  }, [recipes, searchTerm, categoryFilter]);

  const sortedRecipes = useMemo(() => {
    return [...filteredRecipes].sort((a, b) => {
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
      if (sortType === "date-newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortType === "date-oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return 0;
    });
  }, [filteredRecipes, sortType]);

  const visibleRecipes = useMemo(() => {
    return sortedRecipes.slice(0, displayCount);
  }, [sortedRecipes, displayCount]);

  const hasMoreRecipes = displayCount < sortedRecipes.length;

  const handleLoadMore = useCallback(() => {
    setDisplayCount(prev => prev + 8);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    sortType,
    setSortType,
    displayCount,
    setDisplayCount,
    filteredRecipes,
    sortedRecipes,
    visibleRecipes,
    hasMoreRecipes,
    handleLoadMore,
  };
}
