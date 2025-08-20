
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useCommunityRecipes } from "@/hooks/useCommunityRecipes";
import { useCommunityRecipeList } from "@/hooks/useCommunityRecipeList";
import { useMobileLayout } from "@/hooks/useMobileLayout";
import { CommunityRecipeGrid } from "@/components/community/CommunityRecipeGrid";
import { MobileLayoutSelector } from "@/components/recipes/MobileLayoutSelector";
import { useIsMobile } from "@/hooks/use-mobile";
import { DropdownFilterSection } from "@/components/recipes/filters/DropdownFilterSection";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MEAL_TYPE_OPTIONS,
  CUISINE_REGION_OPTIONS,
  DIET_LIFESTYLE_OPTIONS,
  COOKING_DURATION_OPTIONS,
} from "@/utils/recipeClassification";

export const FindRecipesContent = () => {
  const { user } = useAuth();
  const { currentHousehold, isLoadingHousehold } = useHousehold();
  const { recipes, isLoading, totalCount, fetchCommunityRecipes } = useCommunityRecipes();

  // Use refs to track when we've already loaded data
  const lastLoadedUserIdRef = useRef<string | null>(null);
  const lastLoadedHouseholdIdRef = useRef<string | null>(null);
  const hasLoadedRef = useRef(false);

  // Custom hooks for managing state
  const {
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
  } = useCommunityRecipeList({ recipes });

  const { mobileLayout, handleMobileLayoutChange } = useMobileLayout();
  const isMobile = useIsMobile();

  // Load initial recipes - only when we have stable user and household data
  useEffect(() => {
    const userId = user?.id;
    const householdId = currentHousehold?.id;
    
    // Only load if we have user and household, and they've actually changed
    if (!userId || !householdId || isLoadingHousehold) {
      return;
    }

    // Check if we've already loaded for this user/household combination
    if (lastLoadedUserIdRef.current === userId && 
        lastLoadedHouseholdIdRef.current === householdId && 
        hasLoadedRef.current) {
      return;
    }

    console.log('DEBUG: Loading community recipes for household:', householdId);
    
    lastLoadedUserIdRef.current = userId;
    lastLoadedHouseholdIdRef.current = householdId;
    hasLoadedRef.current = true;
    
    fetchCommunityRecipes({
      limit: 50,
      offset: 0
    });
  }, [user?.id, currentHousehold?.id, isLoadingHousehold, fetchCommunityRecipes]);

  const toggleArrayFilter = (key: keyof typeof filters, value: string) => {
    const currentArray = filters[key] as string[];
    const updatedArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    handleFiltersChange({ ...filters, [key]: updatedArray });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'searchTerm') return false;
    if (Array.isArray(value)) return value.length > 0;
    return false;
  });

  const activeFilterCount = filters.mealTypes.length + 
                           filters.cuisineRegions.length + 
                           filters.dietLifestyle.length + 
                           filters.cookingDurations.length;

  const clearAllFilters = () => {
    handleFiltersChange({
      searchTerm: filters.searchTerm,
      mealTypes: [],
      cuisineRegions: [],
      dietLifestyle: [],
      cookingDurations: [],
      showFavoritesOnly: false,
      showNotCookedOnly: false,
    });
  };

  if (!user) {
    return (
      <div className="py-10 text-center px-4">
        <p className="text-muted-foreground mb-4">Please log in to discover and save recipes.</p>
      </div>
    );
  }

  // Show loading state while household is being determined
  if (isLoadingHousehold) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground">Loading your household...</p>
      </div>
    );
  }

  if (!currentHousehold) {
    return (
      <div className="py-10 text-center px-4">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-navy mb-2">No Household Selected</h2>
          <p className="text-muted-foreground mb-6">
            You need to create or join a household to discover and save recipes.
          </p>
          <Button asChild className="bg-terracotta hover:bg-terracotta/90">
            <Link to="/household">
              Manage Household
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Show loading skeleton for just the recipe grid area
  const showLoadingSkeleton = isLoading;

  return (
    <div className={`space-y-4 sm:space-y-6 ${isMobile ? 'bg-white min-h-screen' : ''}`}>
      {/* Mobile Grid Layout */}
      {isMobile ? (
        <div className="space-y-3">
          {/* Row 1: Search | Sort | Layout */}
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <Input
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm"
            />
            
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [newSortBy, newSortOrder] = value.split('-');
              setSortBy(newSortBy as "title" | "prepTime" | "cookTime" | "dateAdded");
              setSortOrder(newSortOrder as "asc" | "desc");
            }}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateAdded-desc">Newest First</SelectItem>
                <SelectItem value="dateAdded-asc">Oldest First</SelectItem>
                <SelectItem value="title-asc">Title A-Z</SelectItem>
                <SelectItem value="title-desc">Title Z-A</SelectItem>
                <SelectItem value="prepTime-asc">Prep Time ↑</SelectItem>
                <SelectItem value="prepTime-desc">Prep Time ↓</SelectItem>
                <SelectItem value="cookTime-asc">Cook Time ↑</SelectItem>
                <SelectItem value="cookTime-desc">Cook Time ↓</SelectItem>
              </SelectContent>
            </Select>

            <div className="w-[60px]">
              <MobileLayoutSelector
                value={mobileLayout}
                onChange={handleMobileLayoutChange}
              />
            </div>
          </div>

          {/* Row 2: All filters - matching My Recipes approach */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <DropdownFilterSection
                title="🕒 Meal"
                options={MEAL_TYPE_OPTIONS}
                selectedValues={filters.mealTypes}
                onToggle={(value) => toggleArrayFilter('mealTypes', value)}
              />

              <DropdownFilterSection
                title="🌍 Cuisine"
                options={CUISINE_REGION_OPTIONS}
                selectedValues={filters.cuisineRegions}
                onToggle={(value) => toggleArrayFilter('cuisineRegions', value)}
              />

              <DropdownFilterSection
                title="🥗 Diet"
                options={DIET_LIFESTYLE_OPTIONS}
                selectedValues={filters.dietLifestyle}
                onToggle={(value) => toggleArrayFilter('dietLifestyle', value)}
              />

              <DropdownFilterSection
                title="⏰ Duration"
                options={COOKING_DURATION_OPTIONS}
                selectedValues={filters.cookingDurations}
                onToggle={(value) => toggleArrayFilter('cookingDurations', value)}
              />
            </div>
          </div>

          {/* Row 3: Clear filters */}
          <div className="flex justify-end items-center">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Clear all filters ({activeFilterCount})
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Desktop Layout */
        <div>
          {/* Search, Sort Controls */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="w-32 sm:w-48">
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [newSortBy, newSortOrder] = value.split('-');
                setSortBy(newSortBy as "title" | "prepTime" | "cookTime" | "dateAdded");
                setSortOrder(newSortOrder as "asc" | "desc");
              }}>
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dateAdded-desc">Newest First</SelectItem>
                  <SelectItem value="dateAdded-asc">Oldest First</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                  <SelectItem value="prepTime-asc">Prep Time (Low to High)</SelectItem>
                  <SelectItem value="prepTime-desc">Prep Time (High to Low)</SelectItem>
                  <SelectItem value="cookTime-asc">Cook Time (Low to High)</SelectItem>
                  <SelectItem value="cookTime-desc">Cook Time (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filters directly under search bar - using the exact same gap as My Recipes */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <DropdownFilterSection
                title="🕒 Meal Type"
                options={MEAL_TYPE_OPTIONS}
                selectedValues={filters.mealTypes}
                onToggle={(value) => toggleArrayFilter('mealTypes', value)}
              />

              <DropdownFilterSection
                title="🌍 Cuisine"
                options={CUISINE_REGION_OPTIONS}
                selectedValues={filters.cuisineRegions}
                onToggle={(value) => toggleArrayFilter('cuisineRegions', value)}
              />

              <DropdownFilterSection
                title="⏰ Duration"
                options={COOKING_DURATION_OPTIONS}
                selectedValues={filters.cookingDurations}
                onToggle={(value) => toggleArrayFilter('cookingDurations', value)}
              />

              <DropdownFilterSection
                title="🍎 Diet & Lifestyle"
                options={DIET_LIFESTYLE_OPTIONS}
                selectedValues={filters.dietLifestyle}
                onToggle={(value) => toggleArrayFilter('dietLifestyle', value)}
              />
            </div>
            {hasActiveFilters && (
              <div className="mt-3">
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                >
                  Clear all filters ({activeFilterCount})
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {showLoadingSkeleton ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-48 w-full rounded-lg bg-muted animate-pulse" />
              <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      ) : filteredAndSortedRecipes.length === 0 ? (
        <div className="text-center py-8 px-4">
          <p className="text-muted-foreground">No community recipes found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <CommunityRecipeGrid
            recipes={visibleRecipes}
            mobileLayout={mobileLayout}
          />
          
          <div className="flex flex-col items-center gap-4 mt-6 px-4">
            {hasMoreRecipes && (
              <Button onClick={handleLoadMore} variant="outline" className="w-full sm:w-auto">
                Load More Recipes
              </Button>
            )}
            <p className="text-sm text-muted-foreground text-center">
              Showing {visibleRecipes.length} of {filteredAndSortedRecipes.length} community recipes
            </p>
          </div>
        </>
      )}
    </div>
  );
};
