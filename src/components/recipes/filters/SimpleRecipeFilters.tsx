
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FilterHeader } from "./FilterHeader";
import { DropdownFilterSection } from "./DropdownFilterSection";
import { Heart, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MealType, CuisineRegion, DietLifestyle, CookingDuration } from "@/types";
import {
  MEAL_TYPE_OPTIONS,
  CUISINE_REGION_OPTIONS,
  DIET_LIFESTYLE_OPTIONS,
  COOKING_DURATION_OPTIONS,
} from "@/utils/recipeClassification";

export interface SimpleRecipeFilters {
  searchTerm: string;
  mealTypes: MealType[];
  cuisineRegions: CuisineRegion[];
  dietLifestyle: DietLifestyle[];
  cookingDurations: CookingDuration[];
  showFavoritesOnly: boolean;
  showNotCookedOnly: boolean;
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
    onFiltersChange({
      searchTerm: filters.searchTerm, // Keep search term
      mealTypes: [],
      cuisineRegions: [],
      dietLifestyle: [],
      cookingDurations: [],
      showFavoritesOnly: false,
      showNotCookedOnly: false,
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

  const toggleNotCooked = () => {
    updateFilter('showNotCookedOnly', !filters.showNotCookedOnly);
  };

  // If alwaysVisible is true, render without card wrapper and header
  if (alwaysVisible) {
    return (
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

          {isMobile && (
            <>
              <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-background">
                <Heart className={`h-4 w-4 ${filters.showFavoritesOnly ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                <Switch
                  checked={filters.showFavoritesOnly}
                  onCheckedChange={toggleFavorites}
                />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-background">
                <User className={`h-4 w-4 ${filters.showNotCookedOnly ? "text-orange-500" : "text-gray-500"}`} />
                <Switch
                  checked={filters.showNotCookedOnly}
                  onCheckedChange={toggleNotCooked}
                />
              </div>
            </>
          )}

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

          {!isMobile && (
            <>
              <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-background min-w-[120px]">
                <Heart className={`h-4 w-4 ${filters.showFavoritesOnly ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                <span className="text-sm">Favourites</span>
                <Switch
                  checked={filters.showFavoritesOnly}
                  onCheckedChange={toggleFavorites}
                />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-background min-w-[115px]">
                <User className={`h-4 w-4 ${filters.showNotCookedOnly ? "text-orange-500" : "text-gray-500"}`} />
                <span className="text-sm">Not Cooked</span>
                <Switch
                  checked={filters.showNotCookedOnly}
                  onCheckedChange={toggleNotCooked}
                />
              </div>
            </>
          )}
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

          <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-background min-w-[120px]">
            <Heart className={`h-4 w-4 ${filters.showFavoritesOnly ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
            <span className="text-sm">Favourites</span>
            <Switch
              checked={filters.showFavoritesOnly}
              onCheckedChange={toggleFavorites}
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-background min-w-[115px]">
            <User className={`h-4 w-4 ${filters.showNotCookedOnly ? "text-orange-500" : "text-gray-500"}`} />
            <span className="text-sm">Not Cooked</span>
            <Switch
              checked={filters.showNotCookedOnly}
              onCheckedChange={toggleNotCooked}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
