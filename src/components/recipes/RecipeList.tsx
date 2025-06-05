
import { useState, useEffect } from "react";
import { useRecipeList } from "@/hooks/useRecipeList";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useNavigationState } from "@/hooks/useNavigationState";
import { useMobileLayout } from "@/hooks/useMobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { RecipeListSearch } from "./RecipeListSearch";
import { RecipeListMobileFilters } from "./RecipeListMobileFilters";
import { RecipeListResults } from "./RecipeListResults";
import { SimpleRecipeFiltersComponent } from "./filters/SimpleRecipeFilters";
import { Recipe } from "@/types";

interface RecipeListProps {
  recipes: Recipe[];
  isLoading: boolean;
  onAddToMealPlan?: (recipe: Recipe) => void;
}

export function RecipeList({ recipes, isLoading, onAddToMealPlan }: RecipeListProps) {
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
  } = useRecipeList({ recipes });

  const { saveScrollPosition } = useScrollPosition();
  const { navigationState, setNavigationState } = useNavigationState();
  const { mobileLayout, handleMobileLayoutChange } = useMobileLayout();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Restore scroll position if the flag is set
    if (sessionStorage.getItem('restoreRecipesScroll') === 'true') {
      window.scrollTo({
        top: parseInt(sessionStorage.getItem('scrollPosition') || '0', 10),
        behavior: 'instant'
      });
      sessionStorage.removeItem('restoreRecipesScroll');
    }
  }, []);

  const handleRecipeClick = (recipeId: string) => {
    console.log('Recipe clicked, saving scroll position');
    
    const currentLayout = localStorage.getItem('mobileRecipeLayout') || '1';
    saveScrollPosition('recipes', currentLayout);
    
    setNavigationState(prev => ({ ...prev, shouldRestoreScroll: true }));
    
    sessionStorage.setItem('restoreRecipesScroll', 'true');
    sessionStorage.setItem('navigatedFromRecipes', 'true');
  };

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
                           filters.complexityLevels.length + 
                           (filters.showFavoritesOnly ? 1 : 0);

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

  if (isLoading) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground">Loading recipes...</p>
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
      
      <RecipeListResults
        filteredAndSortedRecipes={filteredAndSortedRecipes}
        visibleRecipes={visibleRecipes}
        hasMoreRecipes={hasMoreRecipes}
        handleLoadMore={handleLoadMore}
        mobileLayout={mobileLayout}
        onRecipeClick={handleRecipeClick}
        onAddToMealPlan={onAddToMealPlan}
      />
    </div>
  );
}
