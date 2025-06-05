
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useCommunityRecipes } from "@/hooks/useCommunityRecipes";
import { useCommunityRecipeList } from "@/hooks/useCommunityRecipeList";
import { useMobileLayout } from "@/hooks/useMobileLayout";
import { CommunityRecipeGrid } from "@/components/community/CommunityRecipeGrid";
import { SimpleRecipeFiltersComponent } from "@/components/recipes/filters/SimpleRecipeFilters";
import { RecipeListSearch } from "@/components/recipes/RecipeListSearch";
import { RecipeListMobileFilters } from "@/components/recipes/RecipeListMobileFilters";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";

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
    if (key === 'showFavoritesOnly') return value === true;
    if (Array.isArray(value)) return value.length > 0;
    return false;
  });

  const activeFilterCount = filters.mealTypes.length + 
                           filters.cuisineRegions.length + 
                           filters.dietLifestyle.length + 
                           filters.complexityLevels.length;

  const clearAllFilters = () => {
    handleFiltersChange({
      searchTerm: filters.searchTerm,
      mealTypes: [],
      cuisineRegions: [],
      dietLifestyle: [],
      complexityLevels: [],
      showFavoritesOnly: false,
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

  if (isLoading) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground">Loading community recipes...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 sm:space-y-6 ${isMobile ? 'bg-cream min-h-screen' : ''}`}>
      {isMobile ? (
        <div className="space-y-3">
          <RecipeListSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            isMobile={true}
          />
          
          <RecipeListMobileFilters
            filters={filters}
            handleFiltersChange={handleFiltersChange}
            mobileLayout={mobileLayout}
            handleMobileLayoutChange={handleMobileLayoutChange}
            toggleArrayFilter={toggleArrayFilter}
            hasActiveFilters={hasActiveFilters}
            activeFilterCount={activeFilterCount}
            clearAllFilters={clearAllFilters}
          />
        </div>
      ) : (
        <div>
          <RecipeListSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            isMobile={false}
          />

          <SimpleRecipeFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isOpen={filtersOpen}
            onToggle={toggleFilters}
            alwaysVisible={true}
          />
        </div>
      )}
      
      {filteredAndSortedRecipes.length === 0 ? (
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
