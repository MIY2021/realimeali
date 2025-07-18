
import { useState, useMemo, useCallback } from "react";
import { Recipe, MealType, CuisineRegion, DietLifestyle, ComplexityLevel } from "@/types";
import { SimpleRecipeFilters } from "@/components/recipes/filters/SimpleRecipeFilters";

interface UseRecipeListProps {
  recipes: Recipe[];
  initialFilters?: SimpleRecipeFilters;
}

export function useRecipeList({ recipes, initialFilters }: UseRecipeListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "prepTime" | "cookTime" | "dateAdded">("dateAdded");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [visibleCount, setVisibleCount] = useState(12);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<SimpleRecipeFilters>(initialFilters || {
    searchTerm: "",
    mealTypes: [],
    cuisineRegions: [],
    dietLifestyle: [],
    complexityLevels: [],
    showFavoritesOnly: false,
    showNotCookedOnly: false,
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

    // Filter by favourites only
    if (filters.showFavoritesOnly) {
      filtered = filtered.filter(recipe => recipe.is_favorite);
    }

    // Filter by not cooked only
    if (filters.showNotCookedOnly) {
      filtered = filtered.filter(recipe => !recipe.has_cooked);
    }

    // Filter by meal types
    if (filters.mealTypes.length > 0) {
      filtered = filtered.filter(recipe => {
        // Check both new meal_types array and legacy meal_type field
        const recipeMealTypes = recipe.meal_types || (recipe.meal_type ? [recipe.meal_type] : []);
        return recipeMealTypes.some(type => filters.mealTypes.includes(type));
      });
    }

    // Filter by cuisine regions
    if (filters.cuisineRegions.length > 0) {
      filtered = filtered.filter(recipe => 
        recipe.cuisine_region && filters.cuisineRegions.includes(recipe.cuisine_region)
      );
    }

    // Filter by diet/lifestyle
    if (filters.dietLifestyle.length > 0) {
      filtered = filtered.filter(recipe => 
        recipe.diet_lifestyle && recipe.diet_lifestyle.some(diet => 
          filters.dietLifestyle.includes(diet)
        )
      );
    }

    // Filter by complexity levels
    if (filters.complexityLevels.length > 0) {
      filtered = filtered.filter(recipe => 
        recipe.complexity_level && filters.complexityLevels.includes(recipe.complexity_level)
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
          valueA = a.prep_time;
          valueB = b.prep_time;
          break;
        case "cookTime":
          valueA = a.cook_time;
          valueB = b.cook_time;
          break;
        case "dateAdded":
          valueA = new Date(a.created_at).getTime();
          valueB = new Date(b.created_at).getTime();
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

  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => prev + 12);
  }, []);

  const handleFiltersChange = useCallback((newFilters: SimpleRecipeFilters) => {
    setFilters(newFilters);
    setVisibleCount(12); // Reset visible count when filters change
  }, []);

  const toggleFilters = useCallback(() => {
    setFiltersOpen(!filtersOpen);
  }, [filtersOpen]);

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
