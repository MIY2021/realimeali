import { useIsMobile } from "@/hooks/use-mobile";
import { useMobileLayout } from "@/hooks/useMobileLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { DropdownFilterSection } from "../recipes/filters/DropdownFilterSection";
import { MobileLayoutSelector } from "../recipes/MobileLayoutSelector";

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
  keyword: string;
  setKeyword: (keyword: string) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  filters: {
    mealTypes: string[];
    cuisineTypes: string[];
    cookingDurations: string[];
    dietLifestyle: string[];
  };
  onFiltersChange: (filters: {
    mealTypes: string[];
    cuisineTypes: string[];
    cookingDurations: string[];
    dietLifestyle: string[];
  }) => void;
  onReset: () => void;
  onSearch: () => void;
  mobileLayout: string;
  onMobileLayoutChange: (layout: string) => void;
}

export function DiscoverRecipesFilters({ 
  keyword, 
  setKeyword, 
  sortBy, 
  setSortBy, 
  filters, 
  onFiltersChange, 
  onReset, 
  onSearch,
  mobileLayout,
  onMobileLayoutChange
}: DiscoverRecipesFiltersProps) {
  const isMobile = useIsMobile();

  const hasActiveFilters = filters.mealTypes.length > 0 || 
                          filters.cuisineTypes.length > 0 || 
                          filters.cookingDurations.length > 0 || 
                          filters.dietLifestyle.length > 0;

  const activeFilterCount = filters.mealTypes.length + 
                           filters.cuisineTypes.length + 
                           filters.cookingDurations.length + 
                           filters.dietLifestyle.length;

  const toggleArrayFilter = (key: keyof typeof filters, value: string) => {
    const currentArray = filters[key] as string[];
    const updatedArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    onFiltersChange({ ...filters, [key]: updatedArray });
  };

  return (
    <div className={`space-y-4 sm:space-y-6 ${isMobile ? 'bg-surface' : ''}`}>
      {/* Mobile Grid Layout */}
      {isMobile ? (
        <div className="space-y-3">
          {/* Row 1: Search | Sort | Layout */}
          <div className="grid gap-2 grid-cols-[1fr_1fr_auto]">
            <Input
              placeholder="Search recipes..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full text-sm"
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            />
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>

            <div className="w-[60px]">
              <MobileLayoutSelector
                value={mobileLayout}
                onChange={onMobileLayoutChange}
              />
            </div>
          </div>

          {/* Row 2: All filters - wider cuisine dropdown */}
          <div className="grid gap-2 grid-cols-[1fr_1.2fr_1fr_1fr]">
            <DropdownFilterSection
              title="🕒 Meal"
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

            <DropdownFilterSection
              title="🥗 Diet"
              options={DIET_LIFESTYLE_OPTIONS}
              selectedValues={filters.dietLifestyle}
              onToggle={(value) => toggleArrayFilter('dietLifestyle', value)}
            />

            <DropdownFilterSection
              title="⏰ Duration"
              options={COOKING_DURATION_OPTIONS}
              selectedValues={filters.cookingDurations}
              onToggle={(value) => toggleArrayFilter('cookingDurations', value)}
            />
          </div>

          {/* Row 3: Clear filters and search button */}
          <div className="flex justify-between items-center">            
            {hasActiveFilters ? (
              <button
                onClick={onReset}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Clear filters ({activeFilterCount})
              </button>
            ) : (
              <div></div>
            )}

            <Button 
              onClick={onSearch}
              className="h-9 px-4"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      ) : (
        /* Desktop Layout */
        <div>
          {/* Search, Sort Controls */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search recipes..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full"
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              />
            </div>
            
            <div className="w-32 sm:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={onSearch}
              className="px-6"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Filters */}
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

            <DropdownFilterSection
              title="🥗 Diet & Lifestyle"
              options={DIET_LIFESTYLE_OPTIONS}
              selectedValues={filters.dietLifestyle}
              onToggle={(value) => toggleArrayFilter('dietLifestyle', value)}
            />

            <DropdownFilterSection
              title="⏰ Duration"
              options={COOKING_DURATION_OPTIONS}
              selectedValues={filters.cookingDurations}
              onToggle={(value) => toggleArrayFilter('cookingDurations', value)}
            />

            {hasActiveFilters && (
              <button
                onClick={onReset}
                className="text-sm text-muted-foreground hover:text-foreground underline ml-2"
              >
                Clear all filters ({activeFilterCount})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}