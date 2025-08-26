import { Switch } from "@/components/ui/switch";
import { Heart, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DropdownFilterSection } from "../recipes/filters/DropdownFilterSection";

// Map internal filters to Edamam API values
const MEAL_TYPE_OPTIONS = [
  { value: "breakfast", label: "Breakfast", icon: "🌅" },
  { value: "lunch", label: "Lunch", icon: "☀️" },
  { value: "dinner", label: "Dinner", icon: "🌙" },
  { value: "snack", label: "Snacks", icon: "🍿" },
  { value: "teatime", label: "Sides", icon: "🥗" },
];

const CUISINE_TYPE_OPTIONS = [
  { value: "british", label: "British", icon: "🫖" },
  { value: "american", label: "American", icon: "🍔" },
  { value: "italian", label: "Italian", icon: "🍝" },
  { value: "french", label: "French", icon: "🥖" },
  { value: "mexican", label: "Mexican", icon: "🌮" },
  { value: "indian", label: "Indian", icon: "🍛" },
  { value: "chinese", label: "Chinese", icon: "🥡" },
  { value: "japanese", label: "Japanese", icon: "🍣" },
  { value: "asian", label: "Thai", icon: "🍜" },
  { value: "mediterranean", label: "Mediterranean", icon: "🫒" },
  { value: "middle eastern", label: "Middle Eastern", icon: "🥙" },
  { value: "caribbean", label: "Caribbean", icon: "🏝️" },
  { value: "korean", label: "Korean", icon: "🍲" },
];

const COOKING_DURATION_OPTIONS = [
  { value: "1-15", label: "Under 15 mins", icon: "⚡" },
  { value: "15-30", label: "15-30 mins", icon: "⏱️" },
  { value: "30-60", label: "30-60 mins", icon: "🕐" },
  { value: "60+", label: "Over 1 hour", icon: "🕰️" },
];

const DIET_LIFESTYLE_OPTIONS = [
  { value: "balanced", label: "Balanced", icon: "⚖️" },
  { value: "high-fiber", label: "High Fiber", icon: "🌾" },
  { value: "high-protein", label: "High Protein", icon: "💪" },
  { value: "low-carb", label: "Low Carb", icon: "🥩" },
  { value: "low-fat", label: "Low Fat", icon: "🥗" },
  { value: "vegan", label: "Vegan", icon: "🌱" },
  { value: "vegetarian", label: "Vegetarian", icon: "🥕" },
  { value: "paleo", label: "Paleo", icon: "🦣" },
  { value: "dairy-free", label: "Dairy Free", icon: "🚫" },
  { value: "gluten-free", label: "Gluten Free", icon: "🌾" },
];

interface DiscoverRecipesFiltersProps {
  filters: {
    mealTypes: string[];
    cuisineTypes: string[];
    cookingDurations: string[];
    dietLifestyle: string[];
    showFavoritesOnly: boolean;
    showNotCookedOnly: boolean;
  };
  onFiltersChange: (filters: {
    mealTypes: string[];
    cuisineTypes: string[];
    cookingDurations: string[];
    dietLifestyle: string[];
    showFavoritesOnly: boolean;
    showNotCookedOnly: boolean;
  }) => void;
  onReset: () => void;
}

export function DiscoverRecipesFilters({ filters, onFiltersChange, onReset }: DiscoverRecipesFiltersProps) {
  const isMobile = useIsMobile();

  const hasActiveFilters = filters.mealTypes.length > 0 || 
                          filters.cuisineTypes.length > 0 || 
                          filters.cookingDurations.length > 0 || 
                          filters.dietLifestyle.length > 0 ||
                          filters.showFavoritesOnly ||
                          filters.showNotCookedOnly;

  const activeFilterCount = filters.mealTypes.length + 
                           filters.cuisineTypes.length + 
                           filters.cookingDurations.length + 
                           filters.dietLifestyle.length +
                           (filters.showFavoritesOnly ? 1 : 0) +
                           (filters.showNotCookedOnly ? 1 : 0);

  const toggleArrayFilter = (key: keyof typeof filters, value: string) => {
    const currentArray = filters[key] as string[];
    const updatedArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    onFiltersChange({ ...filters, [key]: updatedArray });
  };

  const toggleFavorites = () => {
    onFiltersChange({ ...filters, showFavoritesOnly: !filters.showFavoritesOnly });
  };

  const toggleNotCooked = () => {
    onFiltersChange({ ...filters, showNotCookedOnly: !filters.showNotCookedOnly });
  };

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
          options={CUISINE_TYPE_OPTIONS}
          selectedValues={filters.cuisineTypes}
          onToggle={(value) => toggleArrayFilter('cuisineTypes', value)}
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
            onClick={onReset}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Clear all filters ({activeFilterCount})
          </button>
        </div>
      )}
    </div>
  );
}