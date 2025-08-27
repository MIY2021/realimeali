import { useState } from "react";
import { DiscoverRecipeFilters } from "@/types/edamam";
import { DiscoverRecipesFilters } from "./DiscoverRecipesFilters";
import { DiscoverRecipesResults } from "./DiscoverRecipesResults";
import { useMobileLayout } from "@/hooks/useMobileLayout";

export function DiscoverRecipesContent() {
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [apiFilters, setApiFilters] = useState<DiscoverRecipeFilters | null>(null);
  const { mobileLayout, handleMobileLayoutChange } = useMobileLayout();
  const [filters, setFilters] = useState({
    mealTypes: [] as string[],
    cuisineTypes: [] as string[],
    cookingDurations: [] as string[],
    dietLifestyle: [] as string[],
  });

  const handleSearch = () => {
    const searchFilters: DiscoverRecipeFilters = {
      keyword: keyword.trim() || undefined,
      mealType: filters.mealTypes[0] || undefined, // Take first selected meal type
      cuisineType: filters.cuisineTypes[0] || undefined, // Take first selected cuisine
      time: filters.cookingDurations[0] || undefined, // Take first selected duration
      diet: filters.dietLifestyle.length > 0 ? filters.dietLifestyle : undefined,
    };

    // Only search if we have some criteria
    if (searchFilters.keyword || searchFilters.mealType || searchFilters.cuisineType || searchFilters.time || searchFilters.diet?.length) {
      setApiFilters(searchFilters);
    }
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
        onSearch={handleSearch}
        mobileLayout={mobileLayout}
        onMobileLayoutChange={handleMobileLayoutChange}
      />

      {/* Results */}
      {apiFilters && (
        <DiscoverRecipesResults filters={apiFilters} mobileLayout={mobileLayout} />
      )}

      {!apiFilters && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto space-y-4">
            <div className="text-6xl">🔍</div>
            <h3 className="text-xl font-semibold text-navy">Ready to discover something tasty? Tap Search to fetch recipes!</h3>
            <p className="text-muted-foreground">
              Use the filters above to search through millions of recipes from around the web!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}