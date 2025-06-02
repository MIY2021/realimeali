
import { Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { AddToMealPlanDialog } from "./AddToMealPlanDialog";
import { useRecipeList } from "@/hooks/useRecipeList";
import { useMobileLayout } from "@/hooks/useMobileLayout";
import { RecipeGrid } from "./RecipeGrid";
import { MobileLayoutSelector } from "./MobileLayoutSelector";
import { useIsMobile } from "@/hooks/use-mobile";
import { Heart } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DropdownFilterSection } from "./filters/DropdownFilterSection";
import {
  MEAL_TYPE_OPTIONS,
  CUISINE_REGION_OPTIONS,
  DIET_LIFESTYLE_OPTIONS,
  COMPLEXITY_LEVEL_OPTIONS,
} from "@/utils/recipeClassification";

interface RecipeListProps {
  recipes: Recipe[];
  showActions?: boolean;
  isLoading?: boolean;
}

export function RecipeList({ 
  recipes, 
  showActions = false, 
  isLoading = false
}: RecipeListProps) {
  // State for meal plan dialog
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [mealPlanDialogOpen, setMealPlanDialogOpen] = useState(false);

  // Custom hooks for managing state
  const {
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filters,
    handleFiltersChange,
    filteredAndSortedRecipes,
    visibleRecipes,
    hasMoreRecipes,
    handleLoadMore,
  } = useRecipeList({ recipes });

  const { mobileLayout, handleMobileLayoutChange } = useMobileLayout();
  const isMobile = useIsMobile();

  const handleAddToMealPlan = (recipe: Recipe) => {
    console.log("Opening meal plan dialog for recipe:", recipe.title);
    setSelectedRecipe(recipe);
    setMealPlanDialogOpen(true);
  };

  const toggleArrayFilter = (key: keyof typeof filters, value: string) => {
    const currentArray = filters[key] as string[];
    const updatedArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    handleFiltersChange({ ...filters, [key]: updatedArray });
  };

  const toggleFavorites = () => {
    handleFiltersChange({ ...filters, showFavoritesOnly: !filters.showFavoritesOnly });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'searchTerm') return false;
    if (key === 'showFavoritesOnly') return value === true;
    if (Array.isArray(value)) return value.length > 0;
    return false;
  });

  const activeFilterCount = filters.mealTypes.length + 
                           filters.cuisineRegions.length + 
                           filters.dietLifestyle.length + 
                           filters.complexityLevels.length +
                           (filters.showFavoritesOnly ? 1 : 0);

  const clearAllFilters = () => {
    handleFiltersChange({
      searchTerm: filters.searchTerm,
      mealTypes: [],
      cuisineRegions: [],
      dietLifestyle: [],
      complexityLevels: [],
      showFavoritesOnly: false,
    });
  };

  if (isLoading) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground">Loading recipes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 3-Column Grid Layout */}
      <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-start">
        {/* Row 1: Search | Sort | Layout */}
        <Input
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-10"
        />
        
        <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
          const [newSortBy, newSortOrder] = value.split('-');
          setSortBy(newSortBy as "title" | "prepTime" | "cookTime");
          setSortOrder(newSortOrder as "asc" | "desc");
        }}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title-asc">Title A-Z</SelectItem>
            <SelectItem value="title-desc">Title Z-A</SelectItem>
            <SelectItem value="prepTime-asc">Prep Time (Low to High)</SelectItem>
            <SelectItem value="prepTime-desc">Prep Time (High to Low)</SelectItem>
            <SelectItem value="cookTime-asc">Cook Time (Low to High)</SelectItem>
            <SelectItem value="cookTime-desc">Cook Time (High to Low)</SelectItem>
          </SelectContent>
        </Select>

        {isMobile && (
          <MobileLayoutSelector
            value={mobileLayout}
            onChange={handleMobileLayoutChange}
          />
        )}

        {/* Row 2: Meal Type | Cuisine | Favourite */}
        <DropdownFilterSection
          title="🕒 Meal Type"
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

        <Button
          variant={filters.showFavoritesOnly ? "default" : "outline"}
          onClick={toggleFavorites}
          className="h-10 px-3 min-w-[60px] flex items-center justify-center"
        >
          <Heart className={`h-4 w-4 ${filters.showFavoritesOnly ? "fill-current" : ""}`} />
        </Button>

        {/* Row 3: Complexity | Diet | Empty */}
        <DropdownFilterSection
          title="⚡ Complexity"
          options={COMPLEXITY_LEVEL_OPTIONS}
          selectedValues={filters.complexityLevels}
          onToggle={(value) => toggleArrayFilter('complexityLevels', value)}
        />

        <DropdownFilterSection
          title="🍎 Diet & Lifestyle"
          options={DIET_LIFESTYLE_OPTIONS}
          selectedValues={filters.dietLifestyle}
          onToggle={(value) => toggleArrayFilter('dietLifestyle', value)}
        />

        {/* Empty cell for alignment */}
        <div></div>
      </div>

      {/* Clear filters button */}
      {hasActiveFilters && (
        <div className="flex justify-start">
          <button
            onClick={clearAllFilters}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Clear all filters ({activeFilterCount})
          </button>
        </div>
      )}
      
      {filteredAndSortedRecipes.length === 0 ? (
        <div className="text-center py-8 px-4">
          <p className="text-muted-foreground">No recipes found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <RecipeGrid
            recipes={visibleRecipes}
            mobileLayout={mobileLayout}
            onAddToMealPlan={handleAddToMealPlan}
          />
          
          <div className="flex flex-col items-center gap-4 mt-6 px-4">
            {hasMoreRecipes && (
              <Button onClick={handleLoadMore} variant="outline" className="w-full sm:w-auto">
                Load More Recipes
              </Button>
            )}
            <p className="text-sm text-muted-foreground text-center">
              Showing {visibleRecipes.length} of {filteredAndSortedRecipes.length} recipes
            </p>
          </div>
        </>
      )}

      <AddToMealPlanDialog
        recipe={selectedRecipe}
        open={mealPlanDialogOpen}
        onOpenChange={setMealPlanDialogOpen}
      />
    </div>
  );
}
