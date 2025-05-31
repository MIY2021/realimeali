import { useState, useMemo } from "react";
import { Recipe } from "@/types";

export function useRecipeList({ recipes }: { recipes: Recipe[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "prepTime" | "cookTime" | "mealPlanCount">("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: "",
    mealTypes: [],
    cuisines: [],
    dietLifestyle: [],
    complexityLevels: [],
    showFavoritesOnly: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 12;

  const toggleFilters = () => {
    setFiltersOpen(!filtersOpen);
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Filtering logic
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const searchTermMatch =
        searchTerm === "" ||
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase());

      const mealTypeMatch =
        filters.mealTypes.length === 0 ||
        (recipe.meal_type && filters.mealTypes.includes(recipe.meal_type));

      const cuisineMatch =
        filters.cuisines.length === 0 ||
        (recipe.cuisine_region && filters.cuisines.includes(recipe.cuisine_region));

      const dietLifestyleMatch =
        filters.dietLifestyle.length === 0 ||
        (recipe.diet_lifestyle &&
          recipe.diet_lifestyle.some((diet) => filters.dietLifestyle.includes(diet)));

      const complexityLevelMatch =
        filters.complexityLevels.length === 0 ||
        (recipe.complexity_level &&
          filters.complexityLevels.includes(recipe.complexity_level));

      const favoritesMatch =
        !filters.showFavoritesOnly || recipe.is_favorite === filters.showFavoritesOnly;

      return (
        searchTermMatch &&
        mealTypeMatch &&
        cuisineMatch &&
        dietLifestyleMatch &&
        complexityLevelMatch &&
        favoritesMatch
      );
    });
  }, [recipes, searchTerm, filters]);

  // Sorting logic
  const filteredAndSortedRecipes = useMemo(() => {
    const sorted = [...filteredRecipes].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "prepTime":
          aValue = a.prep_time;
          bValue = b.prep_time;
          break;
        case "cookTime":
          aValue = a.cook_time;
          bValue = b.cook_time;
          break;
        case "mealPlanCount":
          aValue = a.meal_plan_count || 0;
          bValue = b.meal_plan_count || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredRecipes, sortBy, sortOrder]);

  // Pagination logic
  const visibleRecipes = useMemo(() => {
    const startIndex = (currentPage - 1) * recipesPerPage;
    const endIndex = startIndex + recipesPerPage;
    return filteredAndSortedRecipes.slice(startIndex, endIndex);
  }, [filteredAndSortedRecipes, currentPage, recipesPerPage]);

  const hasMoreRecipes = visibleRecipes.length < filteredAndSortedRecipes.length;

  const handleLoadMore = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  return {
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filters,
    handleFiltersChange,
    filtersOpen,
    toggleFilters,
    filteredAndSortedRecipes,
    visibleRecipes,
    hasMoreRecipes,
    handleLoadMore,
  };
}
