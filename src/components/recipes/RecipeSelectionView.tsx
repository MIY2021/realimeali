import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useRecipeList } from "@/hooks/useRecipeList";
import { useMobileLayout } from "@/hooks/useMobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { RecipeGrid } from "./RecipeGrid";
import { SimpleRecipeFiltersComponent } from "./filters/SimpleRecipeFilters";
import { MobileLayoutSelector } from "./MobileLayoutSelector";
import { DropdownFilterSection } from "./filters/DropdownFilterSection";
import { ViewToggleButtons } from "./ViewToggleButtons";
import { Heart, X, Search, Plus, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
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
import { Recipe, MealType } from "@/types";

interface RecipeSelectionViewProps {
  recipes: Recipe[];
  isLoading: boolean;
  onSelectRecipe?: (recipe: Recipe) => void;
  prefilterMealType?: MealType;
  showAddToMealPlan?: boolean;
  onAddToMealPlan?: (recipe: Recipe) => void;
  defaultMobileLayout?: string;
  initialNotCookedFilter?: boolean;
  initialFavouritesFilter?: boolean;
}

export function RecipeSelectionView({ 
  recipes, 
  isLoading, 
  onSelectRecipe,
  prefilterMealType,
  showAddToMealPlan = true,
  onAddToMealPlan,
  defaultMobileLayout,
  initialNotCookedFilter,
  initialFavouritesFilter
}: RecipeSelectionViewProps) {
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
  } = useRecipeList({ 
    recipes,
    initialFilters: prefilterMealType ? {
      searchTerm: "",
      mealTypes: [prefilterMealType],
      cuisineRegions: [],
      dietLifestyle: [],
      cookingDurations: [],
      showFavoritesOnly: false,
      showNotCookedOnly: false,
    } : initialNotCookedFilter ? {
      searchTerm: "",
      mealTypes: [],
      cuisineRegions: [],
      dietLifestyle: [],
      cookingDurations: [],
      showFavoritesOnly: false,
      showNotCookedOnly: true,
    } : initialFavouritesFilter ? {
      searchTerm: "",
      mealTypes: [],
      cuisineRegions: [],
      dietLifestyle: [],
      cookingDurations: [],
      showFavoritesOnly: true,
      showNotCookedOnly: false,
    } : undefined
  });

  const { mobileLayout, handleMobileLayoutChange } = useMobileLayout();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  
  // Use default layout if provided, otherwise use the stored layout
  const currentMobileLayout = defaultMobileLayout || mobileLayout;

  // Infinite scroll
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useInfiniteScroll({
    onLoadMore: () => {
      setIsLoadingMore(true);
      handleLoadMore();
      // Reset loading state after a short delay to show the spinner
      setTimeout(() => setIsLoadingMore(false), 300);
    },
    hasMore: hasMoreRecipes,
    isLoading: isLoadingMore,
    threshold: 300
  });

  const handleRecipeClick = useCallback((recipe: Recipe) => {
    if (onSelectRecipe) {
      onSelectRecipe(recipe);
    }
  }, [onSelectRecipe]);

  const toggleArrayFilter = (key: keyof typeof filters, value: string) => {
    const currentArray = filters[key] as string[];
    const updatedArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    handleFiltersChange({ ...filters, [key]: updatedArray });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'searchTerm') return false;
    if (key === 'showFavoritesOnly' || key === 'showNotCookedOnly') return value === true;
    if (Array.isArray(value)) return value.length > 0;
    return false;
  });

  const activeFilterCount = filters.mealTypes.length + 
                           filters.cuisineRegions.length + 
                           filters.dietLifestyle.length + 
                           filters.cookingDurations.length + 
                           (filters.showFavoritesOnly ? 1 : 0) +
                           (filters.showNotCookedOnly ? 1 : 0);

  const clearAllFilters = () => {
    handleFiltersChange({
      searchTerm: filters.searchTerm,
      mealTypes: prefilterMealType ? [prefilterMealType] : [],
      cuisineRegions: [],
      dietLifestyle: [],
      cookingDurations: [],
      showFavoritesOnly: false,
      showNotCookedOnly: false,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Show filter structure immediately */}
        {isMobile ? (
          <div className="space-y-3">
            <div className="h-11 w-full bg-muted animate-pulse rounded-lg" />
            <div className="flex gap-2">
              <div className="h-9 flex-1 bg-muted animate-pulse rounded-full" />
              <div className="h-9 w-20 bg-muted animate-pulse rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-9 bg-muted animate-pulse rounded-full" />
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex gap-3 mb-6">
              <div className="h-10 flex-1 bg-muted animate-pulse rounded-lg" />
              <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
            </div>
          </div>
        )}

        {/* Recipe Grid Skeleton */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
          {Array.from({ length: isMobile ? 6 : 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="w-full aspect-[4/3] bg-muted animate-pulse rounded-lg" />
              <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 sm:space-y-6 ${isMobile ? 'min-h-screen' : ''}`}>
      {/* Mobile Grid Layout */}
      {isMobile ? (
        <div className="space-y-3">
          {/* Row 1: Search Bar - Full Width */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 h-11 bg-white border-gray-300 rounded-lg text-sm ${searchTerm ? 'pr-10' : ''}`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Row 2: Sort Dropdown + View Toggle */}
          <div className="flex items-center gap-2">
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [newSortBy, newSortOrder] = value.split('-');
              setSortBy(newSortBy as "title" | "prepTime" | "cookTime" | "dateAdded");
              setSortOrder(newSortOrder as "asc" | "desc");
            }}>
              <SelectTrigger className="flex-1 h-9 bg-white border-gray-300 rounded-full text-sm font-medium text-gray-700">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-white">
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

            {!defaultMobileLayout && (
              <ViewToggleButtons
                value={mobileLayout}
                onChange={handleMobileLayoutChange}
              />
            )}
          </div>

          {/* Row 3: Filter Buttons - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-2">
            <DropdownFilterSection
              title="Meal"
              icon="utensils"
              options={MEAL_TYPE_OPTIONS}
              selectedValues={filters.mealTypes}
              onToggle={(value) => toggleArrayFilter('mealTypes', value)}
            />

            <DropdownFilterSection
              title="Cuisine"
              icon="cuisine"
              options={CUISINE_REGION_OPTIONS}
              selectedValues={filters.cuisineRegions}
              onToggle={(value) => toggleArrayFilter('cuisineRegions', value)}
            />

            <DropdownFilterSection
              title="Diet"
              icon="diet"
              options={DIET_LIFESTYLE_OPTIONS}
              selectedValues={filters.dietLifestyle}
              onToggle={(value) => toggleArrayFilter('dietLifestyle', value)}
            />

            <DropdownFilterSection
              title="Duration"
              icon="clock"
              options={COOKING_DURATION_OPTIONS}
              selectedValues={filters.cookingDurations}
              onToggle={(value) => toggleArrayFilter('cookingDurations', value)}
            />
          </div>

          {/* Row 4: Favorites and Not Cooked toggles + Add Recipe button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Heart className={`h-4 w-4 ${filters.showFavoritesOnly ? 'fill-[#F5B82E] text-[#F5B82E]' : 'text-gray-400'}`} />
                <span className="text-sm text-gray-700">Favourites</span>
                <Switch
                  checked={filters.showFavoritesOnly}
                  onCheckedChange={(checked) => handleFiltersChange({ ...filters, showFavoritesOnly: checked })}
                  className="data-[state=checked]:bg-[#F5B82E]"
                />
              </div>
              <div className="flex items-center gap-2">
                <X className={`h-4 w-4 ${filters.showNotCookedOnly ? 'text-[#F5B82E]' : 'text-gray-400'}`} />
                <span className="text-sm text-gray-700">Not Cooked</span>
                <Switch
                  checked={filters.showNotCookedOnly}
                  onCheckedChange={(checked) => handleFiltersChange({ ...filters, showNotCookedOnly: checked })}
                  className="data-[state=checked]:bg-[#F5B82E]"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear ({activeFilterCount})
                </button>
              )}
              
              {user && currentHousehold && (
                <Button asChild className="h-6 w-6 !min-h-0 !min-w-0 rounded-full bg-[#F5B82E]/50 hover:bg-[#F5B82E]/70 text-white p-0 border-0">
                  <Link to="/my-recipes/new">
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add Recipe</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Desktop Layout */
        <div>
          {/* Search, Sort Controls */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Input
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${searchTerm ? 'pr-10' : ''}`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
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

          {/* Filters directly under search bar */}
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
          <p className="text-muted-foreground">No recipes found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <RecipeGrid
            recipes={visibleRecipes}
            mobileLayout={currentMobileLayout}
            onRecipeClick={handleRecipeClick}
            onAddToMealPlan={showAddToMealPlan ? onAddToMealPlan : undefined}
          />
          
          {/* Infinite scroll sentinel and loading state */}
          <div className="flex flex-col items-center gap-4 mt-6 px-4">
            {hasMoreRecipes && (
              <div ref={sentinelRef} className="w-full flex justify-center py-4">
                {isLoadingMore && (
                  <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
                )}
              </div>
            )}
            <p className="text-sm text-muted-foreground text-center">
              Showing {visibleRecipes.length} of {filteredAndSortedRecipes.length} recipes
            </p>
          </div>
        </>
      )}
    </div>
  );
}