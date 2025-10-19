import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ImportedRecipeCard } from "./ImportedRecipeCard";
import { DiscoverRecipesResults } from "./DiscoverRecipesResults";
import { DropdownFilterSection } from "@/components/recipes/filters/DropdownFilterSection";
import { ViewToggleButtons } from "@/components/recipes/ViewToggleButtons";
import { useFeaturedRecipes } from "@/hooks/useFeaturedRecipes";
import { useReturnFromExternalRecipe } from "@/hooks/useReturnFromExternalRecipe";
import { useMobileLayout } from "@/hooks/useMobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MEAL_TYPE_OPTIONS,
  CUISINE_REGION_OPTIONS,
  DIET_LIFESTYLE_OPTIONS,
  COOKING_DURATION_OPTIONS,
} from "@/utils/recipeClassification";
import { DiscoverRecipeFilters } from "@/types/edamam";

export function DiscoverRecipesContent() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { mobileLayout, handleMobileLayoutChange } = useMobileLayout();

  // Featured recipes state
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("priority");
  const [filters, setFilters] = useState({
    mealTypes: [] as string[],
    cuisineTypes: [] as string[],
    dietLifestyle: [] as string[],
    cookingDurations: [] as string[],
  });

  // Web search state
  const [showWebResults, setShowWebResults] = useState(false);
  const [webSearchFilters, setWebSearchFilters] = useState<DiscoverRecipeFilters | null>(null);
  const [addedRecipeUrls, setAddedRecipeUrls] = useState<Set<string>>(new Set());

  // Fetch featured recipes with filters
  const {
    recipes: featuredRecipes,
    isLoading,
    hasMore,
    loadMore,
  } = useFeaturedRecipes({
    initialFilters: {
      keyword,
      sortBy,
      mealTypes: filters.mealTypes,
      cuisineTypes: filters.cuisineTypes,
      dietLifestyle: filters.dietLifestyle,
      cookingDurations: filters.cookingDurations,
    },
  });

  // Return from external recipe detection
  const { showImportDialog, pendingRecipe, closeDialog } = useReturnFromExternalRecipe();

  const toggleArrayFilter = (key: keyof typeof filters, value: string) => {
    const currentArray = filters[key] as string[];
    const updatedArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    setFilters({ ...filters, [key]: updatedArray });
  };

  const hasActiveFilters = 
    filters.mealTypes.length > 0 ||
    filters.cuisineTypes.length > 0 ||
    filters.dietLifestyle.length > 0 ||
    filters.cookingDurations.length > 0;

  const activeFilterCount = 
    filters.mealTypes.length + 
    filters.cuisineTypes.length + 
    filters.dietLifestyle.length + 
    filters.cookingDurations.length;

  const clearAllFilters = () => {
    setFilters({
      mealTypes: [],
      cuisineTypes: [],
      dietLifestyle: [],
      cookingDurations: [],
    });
    setKeyword("");
  };

  const isSearchValid = keyword.trim().length >= 2 || hasActiveFilters;

  const handleSearchWeb = () => {
    if (!isSearchValid) {
      toast.error("Add a search term or choose a filter, then press Search.");
      return;
    }

    setWebSearchFilters({
      keyword: keyword.trim() || undefined,
      mealType: filters.mealTypes[0],
      cuisineType: filters.cuisineTypes[0],
      time: filters.cookingDurations[0],
      diet: filters.dietLifestyle,
    });
    setShowWebResults(true);
  };

  const handleAddFeaturedRecipe = async (recipe: any) => {
    if (!user || !currentHousehold) {
      toast.error("Please log in and select a household");
      return;
    }

    try {
      // Insert recipe into household recipes
      const { data, error } = await supabase
        .from('recipes')
        .insert({
          title: recipe.title,
          description: recipe.description || '',
          ingredients: recipe.ingredients || [],
          instructions: recipe.instructions || [],
          prep_time: recipe.prep_time || 0,
          cook_time: recipe.cook_time || 0,
          servings: recipe.servings || 1,
          image: recipe.image,
          meal_types: recipe.meal_types || [],
          cuisine_region: recipe.cuisine_region,
          diet_lifestyle: recipe.diet_lifestyle,
          source_url: recipe.source_url,
          user_id: user.id,
          household_id: currentHousehold.id,
          import_method: 'featured',
        })
        .select()
        .single();

      if (error) throw error;

      // Increment add count for the imported recipe
      await supabase
        .from('imported_recipes')
        .update({ add_count: (recipe.add_count || 0) + 1 })
        .eq('id', recipe.id);

      toast.success("Recipe added to My Recipes!");
    } catch (error) {
      console.error('Error adding recipe:', error);
      toast.error("Failed to add recipe. Please try again.");
    }
  };

  const handleStartImport = () => {
    if (pendingRecipe) {
      closeDialog();
      navigate(`/my-recipes/new?url=${encodeURIComponent(pendingRecipe.url)}&tab=url&auto=true`);
    }
  };

  const handleDeclineImport = () => {
    closeDialog();
  };

  return (
    <>
      <div className={`space-y-4 sm:space-y-6 ${isMobile ? 'min-h-screen' : ''}`}>
        {/* Mobile Grid Layout */}
        {isMobile ? (
          <div className="space-y-3">
            {/* Row 1: Search Bar - Full Width */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search recipes..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-10 h-11 bg-white border-gray-300 rounded-lg text-sm"
              />
            </div>

            {/* Row 2: Sort Dropdown + View Toggle */}
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1 h-9 bg-white border-gray-300 rounded-full text-sm font-medium text-gray-700">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="priority">Featured First</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>

              <ViewToggleButtons
                value={mobileLayout}
                onChange={handleMobileLayoutChange}
              />
            </div>

            {/* Row 3: Filter Buttons - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2">
              <DropdownFilterSection
                title="Meal"
                icon="utensils"
                options={MEAL_TYPE_OPTIONS}
                selectedValues={filters.mealTypes}
                onToggle={(value) => toggleArrayFilter('mealTypes', value)}
              />

              <DropdownFilterSection
                title="Cuisine"
                icon="globe"
                options={CUISINE_REGION_OPTIONS}
                selectedValues={filters.cuisineTypes}
                onToggle={(value) => toggleArrayFilter('cuisineTypes', value)}
              />

              <DropdownFilterSection
                title="Diet"
                icon="salad"
                options={DIET_LIFESTYLE_OPTIONS}
                selectedValues={filters.dietLifestyle}
                onToggle={(value) => toggleArrayFilter('dietLifestyle', value)}
              />

              <DropdownFilterSection
                title="Duration"
                icon="clock"
                options={COOKING_DURATION_OPTIONS}
                selectedValues={filters.cookingDurations}
                onToggle={(value) => toggleArrayFilter('cookingDurations', value)}
              />
            </div>

            {/* Row 4: Clear filters button */}
            <div className="flex items-center justify-between">
              <div className="flex-1"></div>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear ({activeFilterCount})
                </button>
              )}
            </div>

            {/* Row 5: Search Recipes Button */}
            <Button
              onClick={handleSearchWeb}
              disabled={!isSearchValid}
              className="w-full bg-[#48A97D] hover:bg-[#3d8a67] text-white h-11"
            >
              <Search className="h-4 w-4 mr-2" />
              Search Recipes
            </Button>
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
                />
              </div>

              <div className="w-48">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="priority">Featured First</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              <DropdownFilterSection
                title="Meal"
                icon="utensils"
                options={MEAL_TYPE_OPTIONS}
                selectedValues={filters.mealTypes}
                onToggle={(value) => toggleArrayFilter('mealTypes', value)}
              />

              <DropdownFilterSection
                title="Cuisine"
                icon="globe"
                options={CUISINE_REGION_OPTIONS}
                selectedValues={filters.cuisineTypes}
                onToggle={(value) => toggleArrayFilter('cuisineTypes', value)}
              />

              <DropdownFilterSection
                title="Diet"
                icon="salad"
                options={DIET_LIFESTYLE_OPTIONS}
                selectedValues={filters.dietLifestyle}
                onToggle={(value) => toggleArrayFilter('dietLifestyle', value)}
              />

              <DropdownFilterSection
                title="Duration"
                icon="clock"
                options={COOKING_DURATION_OPTIONS}
                selectedValues={filters.cookingDurations}
                onToggle={(value) => toggleArrayFilter('cookingDurations', value)}
              />

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear ({activeFilterCount})
                </Button>
              )}
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearchWeb}
              disabled={!isSearchValid}
              className="bg-[#48A97D] hover:bg-[#3d8a67] text-white"
            >
              <Search className="h-4 w-4 mr-2" />
              Search Recipes
            </Button>
          </div>
        )}

        {/* Featured Recipes Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#2C3E50]">Featured Recipes</h2>

          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : featuredRecipes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No featured recipes available right now — try searching for pasta, curry, or chicken.
              </p>
            </div>
          ) : (
            <>
              <div className={isMobile && mobileLayout === '1' ? 
                'grid grid-cols-1 gap-4' : 
                'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              }>
                {featuredRecipes.map((recipe) => (
                  <ImportedRecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    mobileLayout={mobileLayout}
                    onAddToMealPlan={handleAddFeaturedRecipe}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-6">
                  <Button onClick={loadMore} variant="outline">
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Helper text when no web results */}
        {!showWebResults && (
          <p className="text-sm text-center text-muted-foreground mt-4">
            Use search and filters to discover millions more recipes.
          </p>
        )}

        {/* Web Results Section */}
        {showWebResults && webSearchFilters && (
          <div className="space-y-4 mt-8 pt-8 border-t">
            <h2 className="text-lg font-semibold text-[#2C3E50]">More Recipes You Might Like</h2>
            <DiscoverRecipesResults
              filters={webSearchFilters}
              mobileLayout={mobileLayout}
              addedRecipeUrls={addedRecipeUrls}
              onRecipeAdded={(url) => setAddedRecipeUrls(prev => new Set([...prev, url]))}
            />
          </div>
        )}
      </div>

      {/* Import Dialog */}
      <AlertDialog open={showImportDialog} onOpenChange={(open) => !open && closeDialog()}>
        <AlertDialogContent>
          <AlertDialogTitle>Add "{pendingRecipe?.title}" to My Recipes?</AlertDialogTitle>
          <AlertDialogDescription>
            Would you like to save this recipe to your collection?
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeclineImport}>No, Thanks</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartImport} className="bg-[#48A97D]">
              Yes, Add Recipe
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
