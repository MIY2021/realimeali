
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { DropdownFilterSection } from "@/components/recipes/filters/DropdownFilterSection";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  MEAL_TYPE_OPTIONS,
  CUISINE_REGION_OPTIONS,
  COMPLEXITY_LEVEL_OPTIONS,
  DIET_LIFESTYLE_OPTIONS,
} from "@/utils/recipeClassification";

interface FindRecipesFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedArea: string;
  setSelectedArea: (area: string) => void;
  selectedIngredient: string;
  setSelectedIngredient: (ingredient: string) => void;
  onSearch: () => void;
  onClearFilters: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  popularIngredients: string[];
  categories: string[];
  categoriesLoading: boolean;
}

export const FindRecipesFilters = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedArea,
  setSelectedArea,
  selectedIngredient,
  setSelectedIngredient,
  onSearch,
  onClearFilters,
  onKeyPress,
  popularIngredients,
  categories,
  categoriesLoading,
}: FindRecipesFiltersProps) => {
  const isMobile = useIsMobile();

  // Convert selections to arrays for dropdown components
  const categorySelections = selectedCategory === "all" ? [] : [selectedCategory];
  const areaSelections = selectedArea === "all" ? [] : [selectedArea];
  const ingredientSelections = selectedIngredient === "all" ? [] : [selectedIngredient];

  const handleCategoryToggle = (value: string) => {
    setSelectedCategory(categorySelections.includes(value) ? "all" : value);
  };

  const handleAreaToggle = (value: string) => {
    setSelectedArea(areaSelections.includes(value) ? "all" : value);
  };

  const handleIngredientToggle = (value: string) => {
    setSelectedIngredient(ingredientSelections.includes(value) ? "all" : value);
  };

  const hasActiveFilters = selectedCategory !== "all" || selectedArea !== "all" || selectedIngredient !== "all";
  const activeFilterCount = categorySelections.length + areaSelections.length + ingredientSelections.length;

  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search by recipe name or ingredient (e.g., 'chicken curry' or 'bacon')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={onKeyPress}
            className="w-full"
          />
        </div>
        <Button onClick={onSearch} className="bg-terracotta hover:bg-terracotta/90">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter Dropdowns - Exact same layout as My Recipes */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-3">
          <DropdownFilterSection
            title="🕒 Meal Type"
            options={MEAL_TYPE_OPTIONS}
            selectedValues={categorySelections}
            onToggle={handleCategoryToggle}
          />

          <DropdownFilterSection
            title="🌍 Cuisine"
            options={CUISINE_REGION_OPTIONS}
            selectedValues={areaSelections}
            onToggle={handleAreaToggle}
          />

          <DropdownFilterSection
            title="⚡ Complexity"
            options={COMPLEXITY_LEVEL_OPTIONS}
            selectedValues={ingredientSelections}
            onToggle={handleIngredientToggle}
          />

          <DropdownFilterSection
            title="🍎 Diet & Lifestyle"
            options={DIET_LIFESTYLE_OPTIONS}
            selectedValues={[]}
            onToggle={() => {}}
          />
        </div>
        {hasActiveFilters && (
          <div className="mt-3">
            <button
              onClick={onClearFilters}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Clear all filters ({activeFilterCount})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
