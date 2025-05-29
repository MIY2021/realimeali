
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FilterHeader } from "./FilterHeader";
import { DropdownFilterSection } from "./DropdownFilterSection";
import {
  MealType,
  Cuisine,
  DietLifestyle,
  ComplexityLevel,
} from "@/types";
import {
  MEAL_TYPE_OPTIONS,
  CUISINE_OPTIONS,
  DIET_LIFESTYLE_OPTIONS,
  COMPLEXITY_LEVEL_OPTIONS,
} from "@/utils/recipeClassification";

export interface SimpleRecipeFilters {
  searchTerm: string;
  mealTypes: MealType[];
  cuisines: Cuisine[];
  dietLifestyle: DietLifestyle[];
  complexityLevels: ComplexityLevel[];
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
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'searchTerm') return false; // Don't count search term
    if (Array.isArray(value)) return value.length > 0;
    return false;
  });

  const activeFilterCount = filters.mealTypes.length + 
                           filters.cuisines.length + 
                           filters.dietLifestyle.length + 
                           filters.complexityLevels.length;

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: filters.searchTerm, // Keep search term
      mealTypes: [],
      cuisines: [],
      dietLifestyle: [],
      complexityLevels: [],
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

  // If alwaysVisible is true, render without card wrapper and header
  if (alwaysVisible) {
    return (
      <div className="mb-4">
        <div className="flex flex-wrap gap-3">
          <DropdownFilterSection
            title="🕒 Meal Type"
            options={MEAL_TYPE_OPTIONS}
            selectedValues={filters.mealTypes}
            onToggle={(value) => toggleArrayFilter('mealTypes', value)}
          />

          <DropdownFilterSection
            title="🌍 Cuisine"
            options={CUISINE_OPTIONS}
            selectedValues={filters.cuisines}
            onToggle={(value) => toggleArrayFilter('cuisines', value)}
          />

          <DropdownFilterSection
            title="🍎 Diet & Lifestyle"
            options={DIET_LIFESTYLE_OPTIONS}
            selectedValues={filters.dietLifestyle}
            onToggle={(value) => toggleArrayFilter('dietLifestyle', value)}
          />

          <DropdownFilterSection
            title="⚡ Complexity"
            options={COMPLEXITY_LEVEL_OPTIONS}
            selectedValues={filters.complexityLevels}
            onToggle={(value) => toggleArrayFilter('complexityLevels', value)}
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
            options={CUISINE_OPTIONS}
            selectedValues={filters.cuisines}
            onToggle={(value) => toggleArrayFilter('cuisines', value)}
          />

          <DropdownFilterSection
            title="🍎 Diet & Lifestyle"
            options={DIET_LIFESTYLE_OPTIONS}
            selectedValues={filters.dietLifestyle}
            onToggle={(value) => toggleArrayFilter('dietLifestyle', value)}
          />

          <DropdownFilterSection
            title="⚡ Complexity"
            options={COMPLEXITY_LEVEL_OPTIONS}
            selectedValues={filters.complexityLevels}
            onToggle={(value) => toggleArrayFilter('complexityLevels', value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
