
import { useState, useMemo } from "react";
import { Recipe, MealType, Cuisine, DietLifestyle, ComplexityLevel } from "@/types";
import { SimpleRecipeFilters } from "@/components/recipes/filters/SimpleRecipeFilters";

interface UseRecipeListProps {
  recipes: Recipe[];
}

export function useRecipeList({ recipes }: UseRecipeListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "prepTime" | "cookTime">("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [visibleCount, setVisibleCount] = useState(12);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<SimpleRecipeFilters>({
    searchTerm: "",
    mealTypes: [],
    cuisines: [],
    dietLifestyle: [],
    complexityLevels: [],
  });

  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = recipes;

    // Filter by search term
    const searchQuery = searchTerm || filters.searchTerm;
    if (searchQuery) {
      filtered = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filter by meal types
    if (filters.mealTypes.length > 0) {
      filtered = filtered.filter(recipe => 
        recipe.mealType && filters.mealTypes.includes(recipe.mealType)
      );
    }

    // Filter by cuisines
    if (filters.cuisines.length > 0) {
      filtered = filtered.filter(recipe => 
        recipe.cuisine && filters.cuisines.includes(recipe.cuisine)
      );
    }

    // Filter by diet/lifestyle
    if (filters.dietLifestyle.length > 0) {
      filtered = filtered.filter(recipe => 
        recipe.dietLifestyle && recipe.dietLifestyle.some(diet => 
          filters.dietLifestyle.includes(diet)
        )
      );
    }

    // Filter by complexity levels
    if (filters.complexityLevels.length > 0) {
      filtered = filtered.filter(recipe => 
        recipe.complexityLevel && filters.complexityLevels.includes(recipe.complexityLevel)
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
  }, [recipes, searchTerm, filters, sortBy, sortOrder]);

  const visibleRecipes = filteredAndSortedRecipes.slice(0, visibleCount);
  const hasMoreRecipes = visibleCount < filteredAndSortedRecipes.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  const handleFiltersChange = (newFilters: SimpleRecipeFilters) => {
    setFilters(newFilters);
    setVisibleCount(12); // Reset visible count when filters change
  };

  const toggleFilters = () => {
    setFiltersOpen(!filtersOpen);
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
