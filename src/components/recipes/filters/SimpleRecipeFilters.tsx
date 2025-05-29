
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FilterHeader } from "./FilterHeader";
import { FilterSection } from "./FilterSection";
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
}

export function SimpleRecipeFiltersComponent({ 
  filters, 
  onFiltersChange, 
  isOpen, 
  onToggle 
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
      <CardContent className="space-y-6">
        <FilterSection
          title="🕒 Meal Type"
          options={MEAL_TYPE_OPTIONS}
          selectedValues={filters.mealTypes}
          onToggle={(value) => toggleArrayFilter('mealTypes', value)}
          multiSelect={true}
        />

        <FilterSection
          title="🌍 Cuisine"
          options={CUISINE_OPTIONS}
          selectedValues={filters.cuisines}
          onToggle={(value) => toggleArrayFilter('cuisines', value)}
          multiSelect={true}
        />

        <FilterSection
          title="🍎 Diet & Lifestyle"
          options={DIET_LIFESTYLE_OPTIONS}
          selectedValues={filters.dietLifestyle}
          onToggle={(value) => toggleArrayFilter('dietLifestyle', value)}
          multiSelect={true}
        />

        <FilterSection
          title="⚡ Complexity"
          options={COMPLEXITY_LEVEL_OPTIONS}
          selectedValues={filters.complexityLevels}
          onToggle={(value) => toggleArrayFilter('complexityLevels', value)}
          multiSelect={true}
          gridCols="flex gap-2"
        />
      </CardContent>
    </Card>
  );
}
