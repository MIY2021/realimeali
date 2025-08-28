import { useState, useEffect } from "react";
import { DiscoverRecipeFilters } from "@/types/edamam";
import { DiscoverRecipesFilters } from "./DiscoverRecipesFilters";
import { DiscoverRecipesResults } from "./DiscoverRecipesResults";
import { useMobileLayout } from "@/hooks/useMobileLayout";
import { useImportedRecipes } from "@/hooks/useImportedRecipes";
import { ImportedRecipeCard } from "./ImportedRecipeCard";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { addImportedRecipeToHousehold } from "@/services/householdRecipeService";
import { useHousehold } from "@/contexts/HouseholdContext";

export function DiscoverRecipesContent() {
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [apiFilters, setApiFilters] = useState<DiscoverRecipeFilters | null>(null);
  const [showExternalResults, setShowExternalResults] = useState(false);
  const { mobileLayout, handleMobileLayoutChange } = useMobileLayout();
  const [filters, setFilters] = useState({
    mealTypes: [] as string[],
    cuisineTypes: [] as string[],
    cookingDurations: [] as string[],
    dietLifestyle: [] as string[],
  });

  // Load imported recipes by default
  const { currentHousehold } = useHousehold();
  const {
    recipes: importedRecipes,
    isLoading: isLoadingImported,
    hasMore: hasMoreImported,
    loadMore: loadMoreImported,
    total: totalImported
  } = useImportedRecipes({
    keyword: keyword.trim() || undefined,
    mealType: filters.mealTypes[0] || undefined,
    cuisineType: filters.cuisineTypes[0] || undefined,
    time: filters.cookingDurations[0] || undefined,
    diet: filters.dietLifestyle.length > 0 ? filters.dietLifestyle : undefined,
  });

  const handleAddToMealPlan = async (recipe: any) => {
    if (!currentHousehold?.id) {
      toast({
        title: "Error",
        description: "Please select a household first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await addImportedRecipeToHousehold(recipe, recipe.imported_by, currentHousehold.id);
      if (result.success) {
        toast({
          title: "Recipe Added",
          description: `${recipe.title} has been added to your recipes!`,
        });
      } else {
        toast({
          title: "Error", 
          description: result.error || "Failed to add recipe. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSearchExternal = () => {
    const searchFilters: DiscoverRecipeFilters = {
      keyword: keyword.trim() || undefined,
      mealType: filters.mealTypes[0] || undefined,
      cuisineType: filters.cuisineTypes[0] || undefined,
      time: filters.cookingDurations[0] || undefined,
      diet: filters.dietLifestyle.length > 0 ? filters.dietLifestyle : undefined,
    };

    setApiFilters(searchFilters);
    setShowExternalResults(true);
  };

  const handleReset = () => {
    setKeyword("");
    setSortBy("newest");
    setFilters({
      mealTypes: [],
      cuisineTypes: [],
      cookingDurations: [],
      dietLifestyle: [],
    });
    setApiFilters(null);
    setShowExternalResults(false);
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6">
      {/* Filters with integrated search and sort */}
      <DiscoverRecipesFilters
        keyword={keyword}
        setKeyword={setKeyword}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleReset}
        onSearch={() => {}} // We handle search differently now
        mobileLayout={mobileLayout}
        onMobileLayoutChange={handleMobileLayoutChange}
      />

      {/* Imported Recipes (Default View) */}
      <div className="space-y-4">
        {isLoadingImported && importedRecipes.length === 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ) : importedRecipes.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-navy">
                Results {totalImported > 0 && `(${totalImported} available)`}
              </h2>
            </div>
            
            <div className={`grid gap-4 ${mobileLayout === '2' ? 'grid-cols-2 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'} lg:grid-cols-3 xl:grid-cols-4`}>
              {importedRecipes.map((recipe) => (
                <ImportedRecipeCard 
                  key={recipe.id}
                  recipe={recipe}
                  onAddToMealPlan={handleAddToMealPlan}
                />
              ))}
            </div>

            {hasMoreImported && (
              <div className="flex justify-center">
                <Button 
                  onClick={loadMoreImported}
                  variant="outline"
                  size="lg"
                >
                  Load More Featured Recipes
                </Button>
              </div>
            )}

            {/* Search External Recipes Button */}
            <div className="text-center pt-8 border-t">
              <div className="max-w-md mx-auto space-y-4">
                <h3 className="text-lg font-semibold text-navy">Want more recipes?</h3>
                <p className="text-muted-foreground">
                  Search millions of additional recipes from around the web!
                </p>
                <Button 
                  onClick={handleSearchExternal}
                  size="lg"
                  className="min-w-[200px]"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search External Recipes
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto space-y-4">
              <div className="text-6xl">🍽️</div>
              <h3 className="text-xl font-semibold text-navy">No featured recipes found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search for recipes from external sources.
              </p>
              <Button 
                onClick={handleSearchExternal}
                size="lg"
              >
                <Search className="w-4 h-4 mr-2" />
                Search External Recipes
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* External Results */}
      {showExternalResults && apiFilters && (
        <div className="space-y-4 border-t pt-6">
          <h2 className="text-lg font-semibold text-navy">External Recipe Results</h2>
          <DiscoverRecipesResults filters={apiFilters} mobileLayout={mobileLayout} />
        </div>
      )}
    </div>
  );
}