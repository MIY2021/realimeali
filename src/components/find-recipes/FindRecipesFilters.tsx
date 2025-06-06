
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { DropdownFilterSection } from "@/components/recipes/filters/DropdownFilterSection";

interface FindRecipesFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  selectedAreas: string[];
  setSelectedAreas: (areas: string[]) => void;
  selectedIngredients: string[];
  setSelectedIngredients: (ingredients: string[]) => void;
  onSearch: () => void;
  onClearFilters: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  popularIngredients: string[];
  categories: string[];
  categoriesLoading: boolean;
}

const AREA_OPTIONS = [
  { value: "American", label: "American", icon: "🇺🇸" },
  { value: "British", label: "British", icon: "🇬🇧" },
  { value: "Canadian", label: "Canadian", icon: "🇨🇦" },
  { value: "Chinese", label: "Chinese", icon: "🇨🇳" },
  { value: "Croatian", label: "Croatian", icon: "🇭🇷" },
  { value: "Dutch", label: "Dutch", icon: "🇳🇱" },
  { value: "Egyptian", label: "Egyptian", icon: "🇪🇬" },
  { value: "French", label: "French", icon: "🇫🇷" },
  { value: "Greek", label: "Greek", icon: "🇬🇷" },
  { value: "Indian", label: "Indian", icon: "🇮🇳" },
  { value: "Irish", label: "Irish", icon: "🇮🇪" },
  { value: "Italian", label: "Italian", icon: "🇮🇹" },
  { value: "Jamaican", label: "Jamaican", icon: "🇯🇲" },
  { value: "Japanese", label: "Japanese", icon: "🇯🇵" },
  { value: "Kenyan", label: "Kenyan", icon: "🇰🇪" },
  { value: "Malaysian", label: "Malaysian", icon: "🇲🇾" },
  { value: "Mexican", label: "Mexican", icon: "🇲🇽" },
  { value: "Moroccan", label: "Moroccan", icon: "🇲🇦" },
  { value: "Polish", label: "Polish", icon: "🇵🇱" },
  { value: "Portuguese", label: "Portuguese", icon: "🇵🇹" },
  { value: "Russian", label: "Russian", icon: "🇷🇺" },
  { value: "Spanish", label: "Spanish", icon: "🇪🇸" },
  { value: "Thai", label: "Thai", icon: "🇹🇭" },
  { value: "Tunisian", label: "Tunisian", icon: "🇹🇳" },
  { value: "Turkish", label: "Turkish", icon: "🇹🇷" },
  { value: "Vietnamese", label: "Vietnamese", icon: "🇻🇳" },
];

export const FindRecipesFilters = ({
  searchQuery,
  setSearchQuery,
  selectedCategories,
  setSelectedCategories,
  selectedAreas,
  setSelectedAreas,
  selectedIngredients,
  setSelectedIngredients,
  onSearch,
  onClearFilters,
  onKeyPress,
  popularIngredients,
  categories,
  categoriesLoading,
}: FindRecipesFiltersProps) => {
  const categoryOptions = categoriesLoading 
    ? [] 
    : categories.map(category => ({
        value: category,
        label: category,
        icon: "🍽️"
      }));

  const ingredientOptions = popularIngredients.map(ingredient => ({
    value: ingredient,
    label: ingredient.charAt(0).toUpperCase() + ingredient.slice(1),
    icon: "🥘"
  }));

  const toggleArrayFilter = (currentArray: string[], value: string, setter: (arr: string[]) => void) => {
    const updatedArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    setter(updatedArray);
  };

  const hasActiveFilters = selectedCategories.length > 0 || 
                          selectedAreas.length > 0 || 
                          selectedIngredients.length > 0;

  const activeFilterCount = selectedCategories.length + 
                           selectedAreas.length + 
                           selectedIngredients.length;

  return (
    <div className="space-y-4 mb-6 w-full">
      <div className="flex gap-2 w-full">
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

      {/* Filters - ensure they use the full width like the search bar above */}
      <div className="w-full">
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full">
          <DropdownFilterSection
            title="🕒 Meal Type"
            options={categoryOptions}
            selectedValues={selectedCategories}
            onToggle={(value) => toggleArrayFilter(selectedCategories, value, setSelectedCategories)}
          />

          <DropdownFilterSection
            title="🌍 Cuisine"
            options={AREA_OPTIONS}
            selectedValues={selectedAreas}
            onToggle={(value) => toggleArrayFilter(selectedAreas, value, setSelectedAreas)}
          />

          <DropdownFilterSection
            title="🥘 Main Ingredient"
            options={ingredientOptions}
            selectedValues={selectedIngredients}
            onToggle={(value) => toggleArrayFilter(selectedIngredients, value, setSelectedIngredients)}
          />
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end mt-3 w-full">
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
