
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Filter, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MealType,
  CuisineRegion,
  CookingMethod,
  DietLifestyle,
  ComplexityLevel,
  MainIngredient,
} from "@/types";
import {
  MEAL_TYPE_OPTIONS,
  CUISINE_REGION_OPTIONS,
  COOKING_METHOD_OPTIONS,
  DIET_LIFESTYLE_OPTIONS,
  COMPLEXITY_LEVEL_OPTIONS,
  MAIN_INGREDIENT_OPTIONS,
} from "@/utils/recipeClassification";

export interface RecipeFilters {
  searchTerm: string;
  mealType?: MealType;
  cuisineRegion?: CuisineRegion;
  cookingMethod?: CookingMethod;
  dietLifestyle: DietLifestyle[];
  complexityLevel?: ComplexityLevel;
  mainIngredient?: MainIngredient;
  maxPrepTime?: number;
  maxCookTime?: number;
}

interface RecipeFiltersProps {
  filters: RecipeFilters;
  onFiltersChange: (filters: RecipeFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function RecipeFiltersComponent({ filters, onFiltersChange, isOpen, onToggle }: RecipeFiltersProps) {
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'searchTerm') return false; // Don't count search term
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null;
  });

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: filters.searchTerm, // Keep search term
      mealType: undefined,
      cuisineRegion: undefined,
      cookingMethod: undefined,
      dietLifestyle: [],
      complexityLevel: undefined,
      mainIngredient: undefined,
      maxPrepTime: undefined,
      maxCookTime: undefined,
    });
  };

  const updateFilter = (key: keyof RecipeFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleDietLifestyle = (diet: DietLifestyle) => {
    const current = filters.dietLifestyle || [];
    const updated = current.includes(diet)
      ? current.filter(d => d !== diet)
      : [...current, diet];
    updateFilter('dietLifestyle', updated);
  };

  const FilterOption = ({ 
    value, 
    label, 
    icon, 
    isSelected, 
    onClick 
  }: { 
    value: string; 
    label: string; 
    icon: string; 
    isSelected: boolean; 
    onClick: () => void; 
  }) => (
    <Button
      variant={isSelected ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className="h-auto p-2 flex flex-col items-center gap-1 min-w-[80px]"
    >
      <span className="text-lg">{icon}</span>
      <span className="text-xs text-center leading-tight">{label}</span>
    </Button>
  );

  if (!isOpen) {
    return (
      <div className="flex items-center gap-2">
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
              {Object.values(filters).filter(v => v && (Array.isArray(v) ? v.length > 0 : true)).length - 1}
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
    <Card className="w-full">
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
      <CardContent>
        <Tabs defaultValue="type" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="type">Type & Time</TabsTrigger>
            <TabsTrigger value="cuisine">Cuisine & Method</TabsTrigger>
            <TabsTrigger value="dietary">Dietary & Ingredients</TabsTrigger>
          </TabsList>

          <TabsContent value="type" className="space-y-4 mt-4">
            {/* Meal Type */}
            <div>
              <h4 className="font-medium mb-3">Meal Type</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {MEAL_TYPE_OPTIONS.map((option) => (
                  <FilterOption
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    icon={option.icon}
                    isSelected={filters.mealType === option.value}
                    onClick={() => updateFilter('mealType', 
                      filters.mealType === option.value ? undefined : option.value
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Complexity Level */}
            <div>
              <h4 className="font-medium mb-3">Complexity</h4>
              <div className="flex gap-2">
                {COMPLEXITY_LEVEL_OPTIONS.map((option) => (
                  <FilterOption
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    icon={option.icon}
                    isSelected={filters.complexityLevel === option.value}
                    onClick={() => updateFilter('complexityLevel', 
                      filters.complexityLevel === option.value ? undefined : option.value
                    )}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cuisine" className="space-y-4 mt-4">
            {/* Cuisine Region */}
            <div>
              <h4 className="font-medium mb-3">Cuisine</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {CUISINE_REGION_OPTIONS.map((option) => (
                  <FilterOption
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    icon={option.icon}
                    isSelected={filters.cuisineRegion === option.value}
                    onClick={() => updateFilter('cuisineRegion', 
                      filters.cuisineRegion === option.value ? undefined : option.value
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Cooking Method */}
            <div>
              <h4 className="font-medium mb-3">Cooking Method</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                {COOKING_METHOD_OPTIONS.map((option) => (
                  <FilterOption
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    icon={option.icon}
                    isSelected={filters.cookingMethod === option.value}
                    onClick={() => updateFilter('cookingMethod', 
                      filters.cookingMethod === option.value ? undefined : option.value
                    )}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dietary" className="space-y-4 mt-4">
            {/* Diet & Lifestyle */}
            <div>
              <h4 className="font-medium mb-3">Diet & Lifestyle</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {DIET_LIFESTYLE_OPTIONS.map((option) => (
                  <FilterOption
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    icon={option.icon}
                    isSelected={filters.dietLifestyle?.includes(option.value) || false}
                    onClick={() => toggleDietLifestyle(option.value)}
                  />
                ))}
              </div>
            </div>

            {/* Main Ingredient */}
            <div>
              <h4 className="font-medium mb-3">Main Ingredient</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {MAIN_INGREDIENT_OPTIONS.map((option) => (
                  <FilterOption
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    icon={option.icon}
                    isSelected={filters.mainIngredient === option.value}
                    onClick={() => updateFilter('mainIngredient', 
                      filters.mainIngredient === option.value ? undefined : option.value
                    )}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
