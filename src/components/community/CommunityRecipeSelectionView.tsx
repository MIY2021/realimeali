import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useCommunityRecipeList } from "@/hooks/useCommunityRecipeList";
import { useMobileLayout } from "@/hooks/useMobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";

import { SimpleRecipeFiltersComponent } from "@/components/recipes/filters/SimpleRecipeFilters";
import { MobileLayoutSelector } from "@/components/recipes/MobileLayoutSelector";
import { DropdownFilterSection } from "@/components/recipes/filters/DropdownFilterSection";
import { Search, Users } from "lucide-react";
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
  COMPLEXITY_LEVEL_OPTIONS,
} from "@/utils/recipeClassification";
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";
import { DiscoverRecipeFilters, EdamamHit } from "@/types/edamam";
import { ExternalRecipeCard } from "@/components/discover-recipes/ExternalRecipeCard";
import { CommunityRecipeCard } from "./CommunityRecipeCard";

interface CommunityRecipeSelectionViewProps {
  recipes: CommunityRecipe[];
  isLoading: boolean;
  communityOnly: boolean;
  onCommunityToggle: (enabled: boolean) => void;
  defaultMobileLayout?: string;
  onSearch: (filters: DiscoverRecipeFilters) => void;
  onClearSearch?: () => void;
  hasSearched?: boolean;
  externalHits?: EdamamHit[];
  externalLoading?: boolean;
  externalHasMore?: boolean;
  onExternalLoadMore?: () => Promise<void>;
}

export function CommunityRecipeSelectionView({ 
  recipes, 
  isLoading, 
  communityOnly,
  onCommunityToggle,
  defaultMobileLayout,
  onSearch,
  onClearSearch,
  hasSearched,
  externalHits,
  externalLoading,
  externalHasMore,
  onExternalLoadMore
}: CommunityRecipeSelectionViewProps) {
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
  
// Use default layout if provided, otherwise use the stored layout
const currentMobileLayout = defaultMobileLayout || mobileLayout;

const getGridCols = () => {
  return currentMobileLayout === "2"
    ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
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
    if (key === 'showFavoritesOnly' || key === 'showNotCookedOnly') return false; // These don't apply to community recipes
    if (Array.isArray(value)) return value.length > 0;
    return false;
  });

  const activeFilterCount = filters.mealTypes.length + 
                           filters.cuisineRegions.length + 
                           filters.dietLifestyle.length + 
                           filters.complexityLevels.length;

const clearAllFilters = () => {
  setSearchTerm("");
  handleFiltersChange({
    searchTerm: "",
    mealTypes: [],
    cuisineRegions: [],
    dietLifestyle: [],
    complexityLevels: [],
    showFavoritesOnly: false,
    showNotCookedOnly: false,
  });
  onClearSearch?.();
};

  const buildExternalFilters = useCallback((): DiscoverRecipeFilters => {
    const keyword = (searchTerm || filters.searchTerm || "").trim();
    return {
      keyword: keyword || undefined,
      mealType: (filters.mealTypes && filters.mealTypes[0]) || undefined,
      cuisineType: (filters.cuisineRegions && filters.cuisineRegions[0]) || undefined,
      diet: filters.dietLifestyle && filters.dietLifestyle.length ? filters.dietLifestyle : undefined,
    };
  }, [searchTerm, filters]);

const handleDiscoverClick = useCallback(() => {
  onSearch(buildExternalFilters());
}, [onSearch, buildExternalFilters]);

const apiResults = externalHits && externalHits.length ? externalHits : [];
const showCommunity = communityOnly;
const communityList = showCommunity ? visibleRecipes : [];
const hasAnyResults = communityList.length > 0 || apiResults.length > 0;
const totalResults = communityList.length + apiResults.length;

  if (isLoading) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground">Loading recipes...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 sm:space-y-6 ${isMobile ? 'bg-white min-h-screen' : ''}`}>
      {/* Mobile Grid Layout */}
      {isMobile ? (
        <div className="space-y-3">
          {/* Row 1: Search | Sort | Layout */}
          <div className={`grid gap-2 ${defaultMobileLayout ? 'grid-cols-[1fr_1fr]' : 'grid-cols-[1fr_1fr_auto]'}`}>
            <Input
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleDiscoverClick(); }}
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

            {!defaultMobileLayout && (
              <div className="w-[60px]">
                <MobileLayoutSelector
                  value={mobileLayout}
                  onChange={handleMobileLayoutChange}
                />
              </div>
            )}
          </div>

          {/* Row 2: All filters on equal width - wider cuisine dropdown */}
          <div className={`grid gap-2 ${defaultMobileLayout ? 'grid-cols-[1fr_1.2fr_1fr_1fr]' : 'grid-cols-[1fr_1.2fr_1fr_1fr]'}`}>
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
              title="⚡ Level"
              options={COMPLEXITY_LEVEL_OPTIONS}
              selectedValues={filters.complexityLevels}
              onToggle={(value) => toggleArrayFilter('complexityLevels', value)}
            />
          </div>

          {/* Row 3: Community toggle and clear filters */}
<div className="flex flex-col gap-2">
  <div className="flex items-center gap-3">
    <div className="flex items-center gap-2 text-sm mr-auto">
      <Users className={`h-4 w-4 ${communityOnly ? 'text-terracotta' : 'text-muted-foreground'}`} />
      <span className="font-medium">Include Community-Shared Recipes</span>
      <Switch
        checked={communityOnly}
        onCheckedChange={onCommunityToggle}
      />
    </div>
    <Button size="sm" onClick={handleDiscoverClick} className="shrink-0">
      <Search className="h-4 w-4 mr-2" />
      Search
    </Button>
  </div>
  <div className="flex items-center justify-between">
    <span className="text-xs text-muted-foreground">{totalResults} result{totalResults !== 1 ? 's' : ''}</span>
    {hasActiveFilters && (
      <button
        onClick={clearAllFilters}
        className="text-sm text-muted-foreground hover:text-foreground underline"
      >
        Clear filters ({activeFilterCount})
      </button>
    )}
  </div>
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
                onKeyDown={(e) => { if (e.key === 'Enter') handleDiscoverClick(); }}
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

{/* Community Toggle for Desktop */}
<div className="flex items-center gap-6 text-sm">
  <div className="flex items-center gap-3">
    <div className="flex items-center gap-2">
      <Users className={`${communityOnly ? 'text-terracotta' : 'text-muted-foreground'} h-4 w-4`} />
      <span>Include Community-Shared Recipes</span>
    </div>
    <Switch
      checked={communityOnly}
      onCheckedChange={onCommunityToggle}
    />
  </div>
  <Button onClick={handleDiscoverClick} className="whitespace-nowrap">
    <Search className="h-4 w-4 mr-2" />
    Search
  </Button>
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
      
{hasAnyResults ? (
  <>
    <div className={`grid ${getGridCols()} gap-4 sm:gap-6`}>
      {communityList.map((recipe) => (
        <CommunityRecipeCard
          key={`c-${recipe.id}`}
          recipe={recipe}
          mobileLayout={currentMobileLayout}
        />
      ))}
      {apiResults.map((hit, index) => (
        <ExternalRecipeCard
          key={`e-${hit.recipe.uri}-${index}`}
          recipe={hit.recipe}
        />
      ))}
    </div>

    {communityOnly && apiResults.length === 0 && hasMoreRecipes && (
      <div className="flex flex-col items-center gap-4 mt-6 px-4">
        <Button onClick={handleLoadMore} variant="outline" className="w-full sm:w-auto">
          Load More Recipes
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          Showing {visibleRecipes.length} of {filteredAndSortedRecipes.length} recipes
        </p>
      </div>
    )}
  </>
) : (
  <div className="text-center py-8 px-4">
    <p className="text-muted-foreground">
      {hasSearched ? 'No recipes found. Try adjusting your search or filters.' : 'Ready to discover something tasty? Tap Search to fetch recipes!'}
    </p>
  </div>
)}
    </div>
  );
}