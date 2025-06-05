
import { Switch } from "@/components/ui/switch";
import { DropdownFilterSection } from "./filters/DropdownFilterSection";
import { MobileLayoutSelector } from "./MobileLayoutSelector";
import { Heart } from "lucide-react";
import {
  MEAL_TYPE_OPTIONS,
  CUISINE_REGION_OPTIONS,
  DIET_LIFESTYLE_OPTIONS,
  COMPLEXITY_LEVEL_OPTIONS,
} from "@/utils/recipeClassification";
import { SimpleRecipeFilters } from "./filters/SimpleRecipeFilters";

interface RecipeListMobileFiltersProps {
  filters: SimpleRecipeFilters;
  handleFiltersChange: (filters: SimpleRecipeFilters) => void;
  mobileLayout: string;
  handleMobileLayoutChange: (layout: string) => void;
  toggleArrayFilter: (key: keyof SimpleRecipeFilters, value: string) => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  clearAllFilters: () => void;
}

export function RecipeListMobileFilters({
  filters,
  handleFiltersChange,
  mobileLayout,
  handleMobileLayoutChange,
  toggleArrayFilter,
  hasActiveFilters,
  activeFilterCount,
  clearAllFilters,
}: RecipeListMobileFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Row 2: All filters on equal width - wider cuisine dropdown */}
      <div className="grid grid-cols-[1fr_1.2fr_1fr_1fr] gap-2">
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

      {/* Row 3: Layout selector, Favorites toggle and clear filters */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-[60px]">
            <MobileLayoutSelector
              value={mobileLayout}
              onChange={handleMobileLayoutChange}
            />
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Heart className={`h-4 w-4 ${filters.showFavoritesOnly ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
            <span>❤️ only</span>
            <Switch
              checked={filters.showFavoritesOnly}
              onCheckedChange={(checked) => handleFiltersChange({ ...filters, showFavoritesOnly: checked })}
            />
          </div>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Clear all filters ({activeFilterCount})
          </button>
        )}
      </div>
    </div>
  );
}
