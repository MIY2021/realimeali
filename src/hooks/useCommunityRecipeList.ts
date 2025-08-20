
import { useState, useMemo, useCallback } from "react";
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";
import { SimpleRecipeFilters } from "@/components/recipes/filters/SimpleRecipeFilters";
import { MealType, CuisineRegion, CookingDuration } from "@/types";
import { getCookingDurationCategory } from "@/utils/recipeClassification";

interface UseCommunityRecipeListProps {
  recipes: CommunityRecipe[];
}

// Helper functions to safely convert community recipe strings to our types
const safeMealTypeConversion = (category: string | null): MealType | null => {
  if (!category) return null;
  const normalized = category.toLowerCase();
  const validMealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snacks", "sides", "desserts", "drinks"];
  return validMealTypes.find(type => type === normalized) || null;
};

const safeCuisineConversion = (cuisine: string | null): CuisineRegion | null => {
  if (!cuisine) return null;
  const normalized = cuisine.toLowerCase();
  const validCuisines: CuisineRegion[] = [
    "british", "american", "italian", "french", "mexican", "indian", "chinese", 
    "japanese", "thai", "mediterranean", "middle_eastern", "african", "korean", 
    "caribbean", "nordic", "eastern_european", "greek"
  ];
  return validCuisines.find(c => c === normalized) || null;
};

const safeCookingDurationConversion = (prepTime: number = 0, cookTime: number = 0): CookingDuration => {
  return getCookingDurationCategory(prepTime, cookTime) as CookingDuration;
};

export function useCommunityRecipeList({ recipes }: UseCommunityRecipeListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "prepTime" | "cookTime" | "dateAdded">("dateAdded");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [visibleCount, setVisibleCount] = useState(12);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<SimpleRecipeFilters>({
    searchTerm: "",
    mealTypes: [],
    cuisineRegions: [],
    dietLifestyle: [],
    cookingDurations: [],
    showFavoritesOnly: false,
    showNotCookedOnly: false, // Add this property
  });

  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = recipes;

    // Filter by search term
    const searchQuery = searchTerm || filters.searchTerm;
    if (searchQuery) {
      filtered = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (recipe.description && recipe.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by meal types (map category to meal types)
    if (filters.mealTypes.length > 0) {
      filtered = filtered.filter(recipe => {
        const safeMealType = safeMealTypeConversion(recipe.category);
        return safeMealType && filters.mealTypes.includes(safeMealType);
      });
    }

    // Filter by cuisine regions
    if (filters.cuisineRegions.length > 0) {
      filtered = filtered.filter(recipe => {
        const safeCuisine = safeCuisineConversion(recipe.cuisine);
        return safeCuisine && filters.cuisineRegions.includes(safeCuisine);
      });
    }

    // Filter by cooking duration
    if (filters.cookingDurations.length > 0) {
      filtered = filtered.filter(recipe => {
        const duration = safeCookingDurationConversion(recipe.prep_time, recipe.cook_time);
        return filters.cookingDurations.includes(duration);
      });
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
