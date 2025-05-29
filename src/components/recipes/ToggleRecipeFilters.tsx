
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Filter, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
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

export interface ToggleRecipeFilters {
  searchTerm: string;
  mealTypes: MealType[];
  cuisines: Cuisine[];
  dietLifestyle: DietLifestyle[];
  complexityLevels: ComplexityLevel[];
}

interface ToggleRecipeFiltersProps {
  filters: ToggleRecipeFilters;
  onFiltersChange: (filters: ToggleRecipeFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function ToggleRecipeFiltersComponent({ 
  filters, 
  onFiltersChange, 
  isOpen, 
  onToggle 
}: ToggleRecipeFiltersProps) {
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'searchTerm') return false; // Don't count search term
    if (Array.isArray(value)) return value.length > 0;
    return false;
  });

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: filters.searchTerm, // Keep search term
      mealTypes: [],
      cuisines: [],
      dietLifestyle: [],
      complexityLevels: [],
    });
  };

  const updateFilter = (key: keyof ToggleRecipeFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const FilterToggleGroup = ({ 
    title, 
    options, 
    selectedValues, 
    onSelectionChange 
  }: { 
    title: string; 
    options: any[]; 
    selectedValues: string[];
    onSelectionChange: (values: string[]) => void;
  }) => (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">{title}</h4>
      <ToggleGroup 
        type="multiple" 
        value={selectedValues}
        onValueChange={onSelectionChange}
        className="flex flex-wrap gap-2 justify-start"
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            aria-label={option.label}
            className="h-auto p-2 flex flex-col items-center gap-1 min-w-[70px] data-[state=on]:bg-terracotta data-[state=on]:text-white hover:bg-terracotta/10"
          >
            <span className="text-lg">{option.icon}</span>
            <span className="text-xs text-center leading-tight">{option.label}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );

  if (!isOpen) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 flex items-center justify-center p-1">
              {filters.mealTypes.length + filters.cuisines.length + filters.dietLifestyle.length + filters.complexityLevels.length}
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filter Recipes</CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <FilterToggleGroup
          title="🕒 Meal Type"
          options={MEAL_TYPE_OPTIONS}
          selectedValues={filters.mealTypes}
          onSelectionChange={(values) => updateFilter('mealTypes', values as MealType[])}
        />

        <FilterToggleGroup
          title="🌍 Cuisine"
          options={CUISINE_OPTIONS}
          selectedValues={filters.cuisines}
          onSelectionChange={(values) => updateFilter('cuisines', values as Cuisine[])}
        />

        <FilterToggleGroup
          title="🍎 Diet & Lifestyle"
          options={DIET_LIFESTYLE_OPTIONS}
          selectedValues={filters.dietLifestyle}
          onSelectionChange={(values) => updateFilter('dietLifestyle', values as DietLifestyle[])}
        />

        <FilterToggleGroup
          title="⚡ Complexity"
          options={COMPLEXITY_LEVEL_OPTIONS}
          selectedValues={filters.complexityLevels}
          onSelectionChange={(values) => updateFilter('complexityLevels', values as ComplexityLevel[])}
        />
      </CardContent>
    </Card>
  );
}
