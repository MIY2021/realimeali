
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterHeader } from "./FilterHeader";
import { DropdownFilterSection } from "./DropdownFilterSection";
import { Heart } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  MealType,
  CuisineRegion,
  DietLifestyle,
  ComplexityLevel,
} from "@/types";
import {
  MEAL_TYPE_OPTIONS,
  CUISINE_REGION_OPTIONS,
  DIET_LIFESTYLE_OPTIONS,
  COMPLEXITY_LEVEL_OPTIONS,
} from "@/utils/recipeClassification";

export interface SimpleRecipeFilters {
  searchTerm: string;
  mealTypes: MealType[];
  cuisineRegions: CuisineRegion[];
  dietLifestyle: DietLifestyle[];
  complexityLevels: ComplexityLevel[];
  showFavoritesOnly: boolean;
}

interface SimpleRecipeFiltersProps {
  filters: SimpleRecipeFilters;
  onFiltersChange: (filters: SimpleRecipeFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
  alwaysVisible?: boolean;
}

export function SimpleRecipeFiltersComponent({ 
  filters, 
  onFiltersChange, 
  isOpen, 
  onToggle,
  alwaysVisible = false
}: SimpleRecipeFiltersProps) {
  const isMobile = useIsMobile();
  
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'searchTerm') return false; // Don't count search term
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
    onFiltersChange({
      searchTerm: filters.searchTerm, // Keep search term
      mealTypes: [],
      cuisineRegions: [],
      dietLifestyle: [],
      complexityLevels: [],
      showFavoritesOnly: false,
    });
  };

  const updateFilter = (key: keyof SimpleRecipeFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: keyof SimpleRecipeFilters, value: string) => {
    const currentArray = filters[key] as string[];
    const updatedArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, updatedArray);
  };

  const toggleFavorites = () => {
    updateFilter('showFavoritesOnly', !filters.showFavoritesOnly);
  };

  // If alwaysVisible is true, render without card wrapper and header
  if (alwaysVisible) {
    return (
      <div className="mb-4">
        {/* Grid layout to align with search/sort row above */}
        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_auto] gap-3">
          {/* Left group - aligns under search */}
          <div className="flex flex-wrap gap-2">
            <DropdownFilterSection
              title="🕒 Meal Type"
              options={MEAL_TYPE_OPTIONS}
              selectedValues={filters.mealTypes}
              onToggle={(value) => toggleArrayFilter('mealTypes', value)}
            />
            <DropdownFilterSection
              title="⚡ Complexity"
              options={COMPLEXITY_LEVEL_OPTIONS}
              selectedValues={filters.complexityLevels}
              onToggle={(value) => toggleArrayFilter('complexityLevels', value)}
            />
          </div>

          {/* Center group - aligns under sort */}
          <div className="flex flex-wrap gap-2">
            <DropdownFilterSection
              title="🌍 Cuisine"
              options={CUISINE_REGION_OPTIONS}
              selectedValues={filters.cuisineRegions}
              onToggle={(value) => toggleArrayFilter('cuisineRegions', value)}
            />
            <DropdownFilterSection
              title="🍎 Diet & Lifestyle"
              options={DIET_LIFESTYLE_OPTIONS}
              selectedValues={filters.dietLifestyle}
              onToggle={(value) => toggleArrayFilter('dietLifestyle', value)}
            />
          </div>

          {/* Right group - aligns under mobile layout selector */}
          <div className="flex justify-start sm:justify-end">
            <Button
              variant={filters.showFavoritesOnly ? "default" : "outline"}
              onClick={toggleFavorites}
              className="flex items-center gap-2 h-10"
              size={isMobile ? "sm" : "default"}
            >
              <Heart className={`h-4 w-4 ${filters.showFavoritesOnly ? "fill-current" : ""}`} />
              {!isMobile && "Favourites"}
            </Button>
          </div>
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
    );
  }

  if (!isOpen) {
    return (
      <FilterHeader
        hasActiveFilters={hasActiveFilters}
        activeFilterCount={activeFilterCount}
        onClearAll={clearAllFilters}
        onToggle={onToggle}
        isOpen={false}
      />
    );
  }

  return (
    <Card className="w-full mb-6">
      <CardHeader className="pb-3">
        <FilterHeader
          hasActiveFilters={hasActiveFilters}
          activeFilterCount={activeFilterCount}
          onClearAll={clearAllFilters}
          onToggle={onToggle}
          isOpen={true}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
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
            title="⚡ Complexity"
            options={COMPLEXITY_LEVEL_OPTIONS}
            selectedValues={filters.complexityLevels}
            onToggle={(value) => toggleArrayFilter('complexityLevels', value)}
          />

          <DropdownFilterSection
            title="🍎 Diet & Lifestyle"
            options={DIET_LIFESTYLE_OPTIONS}
            selectedValues={filters.dietLifestyle}
            onToggle={(value) => toggleArrayFilter('dietLifestyle', value)}
          />

          <Button
            variant={filters.showFavoritesOnly ? "default" : "outline"}
            onClick={toggleFavorites}
            className="flex items-center gap-2 min-w-[140px]"
          >
            ❤️ Favourites Only
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
