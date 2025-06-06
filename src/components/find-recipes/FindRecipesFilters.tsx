
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { DropdownFilterSection } from "@/components/recipes/filters/DropdownFilterSection";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define filter options similar to recipe classification
const MEAL_TYPE_OPTIONS = [
  { value: "Beef", label: "Beef", icon: "🥩" },
  { value: "Chicken", label: "Chicken", icon: "🐔" },
  { value: "Dessert", label: "Dessert", icon: "🧁" },
  { value: "Lamb", label: "Lamb", icon: "🐑" },
  { value: "Miscellaneous", label: "Miscellaneous", icon: "🍽️" },
  { value: "Pasta", label: "Pasta", icon: "🍝" },
  { value: "Pork", label: "Pork", icon: "🐷" },
  { value: "Seafood", label: "Seafood", icon: "🐟" },
  { value: "Side", label: "Side", icon: "🥗" },
  { value: "Starter", label: "Starter", icon: "🥄" },
  { value: "Vegan", label: "Vegan", icon: "🌱" },
  { value: "Vegetarian", label: "Vegetarian", icon: "🥬" },
  { value: "Breakfast", label: "Breakfast", icon: "🍳" },
];

const CUISINE_OPTIONS = [
  { value: "American", label: "American", icon: "🇺🇸" },
  { value: "British", label: "British", icon: "🇬🇧" },
  { value: "Chinese", label: "Chinese", icon: "🇨🇳" },
  { value: "French", label: "French", icon: "🇫🇷" },
  { value: "Greek", label: "Greek", icon: "🇬🇷" },
  { value: "Indian", label: "Indian", icon: "🇮🇳" },
  { value: "Italian", label: "Italian", icon: "🇮🇹" },
  { value: "Japanese", label: "Japanese", icon: "🇯🇵" },
  { value: "Mexican", label: "Mexican", icon: "🇲🇽" },
  { value: "Thai", label: "Thai", icon: "🇹🇭" },
];

const INGREDIENT_OPTIONS = [
  { value: "chicken", label: "Chicken", icon: "🐔" },
  { value: "beef", label: "Beef", icon: "🥩" },
  { value: "pork", label: "Pork", icon: "🐷" },
  { value: "fish", label: "Fish", icon: "🐟" },
  { value: "pasta", label: "Pasta", icon: "🍝" },
  { value: "rice", label: "Rice", icon: "🍚" },
  { value: "potato", label: "Potato", icon: "🥔" },
  { value: "tomato", label: "Tomato", icon: "🍅" },
];

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

      {/* Mobile Dropdown Layout */}
      {isMobile ? (
        <div className="space-y-3">
          {/* Row 1: Meal Type and Cuisine */}
          <div className="grid grid-cols-[1fr_1.2fr] gap-2">
            <DropdownFilterSection
              title="🕒 Meal"
              options={MEAL_TYPE_OPTIONS}
              selectedValues={categorySelections}
              onToggle={handleCategoryToggle}
            />

            <DropdownFilterSection
              title="🌍 Cuisine"
              options={CUISINE_OPTIONS}
              selectedValues={areaSelections}
              onToggle={handleAreaToggle}
            />
          </div>

          {/* Row 2: Main Ingredient */}
          <div className="grid grid-cols-1">
            <DropdownFilterSection
              title="🥩 Main Ingredient"
              options={INGREDIENT_OPTIONS}
              selectedValues={ingredientSelections}
              onToggle={handleIngredientToggle}
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                onClick={onClearFilters}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Desktop Layout */
        <div className="space-y-4">
          {/* Desktop Dropdown Layout */}
          <div className="flex flex-wrap gap-3">
            <DropdownFilterSection
              title="🕒 Meal Type"
              options={MEAL_TYPE_OPTIONS}
              selectedValues={categorySelections}
              onToggle={handleCategoryToggle}
            />

            <DropdownFilterSection
              title="🌍 Cuisine"
              options={CUISINE_OPTIONS}
              selectedValues={areaSelections}
              onToggle={handleAreaToggle}
            />

            <DropdownFilterSection
              title="🥩 Main Ingredient"
              options={INGREDIENT_OPTIONS}
              selectedValues={ingredientSelections}
              onToggle={handleIngredientToggle}
            />

            {hasActiveFilters && (
              <Button variant="outline" onClick={onClearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
