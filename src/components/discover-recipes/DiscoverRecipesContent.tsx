import { useState } from "react";
import { DiscoverRecipesFilters } from "./DiscoverRecipesFilters";
import { DiscoverRecipesResults } from "./DiscoverRecipesResults";
import { CommunityRecipeGrid } from "@/components/community/CommunityRecipeGrid";
import { useCommunityRecipes } from "@/hooks/useCommunityRecipes";
import { DiscoverRecipeFilters } from "@/types/edamam";

export function DiscoverRecipesContent() {
  const [filters, setFilters] = useState<DiscoverRecipeFilters>({});
  const [hasSearched, setHasSearched] = useState(false);
  const [communityOnly, setCommunityOnly] = useState(false);
  
  const { recipes: communityRecipes, isLoading: communityLoading, fetchCommunityRecipes } = useCommunityRecipes();

  const handleSearch = async (newFilters: DiscoverRecipeFilters) => {
    setFilters(newFilters);
    setHasSearched(true);
    
    // If community only mode, fetch community recipes with filters
    if (communityOnly) {
      const communityFilters = {
        search: newFilters.keyword,
        category: newFilters.mealType,
        cuisine: newFilters.cuisineType,
        limit: 20
      };
      await fetchCommunityRecipes(communityFilters);
    }
  };

  const handleReset = () => {
    setFilters({});
    setHasSearched(false);
  };

  const handleCommunityToggle = (enabled: boolean) => {
    setCommunityOnly(enabled);
    if (hasSearched) {
      // Re-trigger search with current filters if we've already searched
      handleSearch(filters);
    }
  };

  return (
    <div className="space-y-6">
      <DiscoverRecipesFilters 
        onSearch={handleSearch} 
        onReset={handleReset}
        communityOnly={communityOnly}
        onCommunityToggle={handleCommunityToggle}
      />
      
      {hasSearched && (
        <>
          {communityOnly ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-navy">
                  Community Recipes ({communityRecipes.length})
                </h2>
                <div className="text-sm text-muted-foreground">
                  From our RealiMeali community
                </div>
              </div>
              {communityLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <div className="h-48 w-full bg-gray-200 rounded-lg animate-pulse" />
                      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : communityRecipes.length > 0 ? (
                <CommunityRecipeGrid 
                  recipes={communityRecipes}
                  mobileLayout="2"
                />
              ) : (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="text-6xl">🔍</div>
                    <h3 className="text-xl font-semibold text-navy">No community recipes found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters or search terms to find community recipes.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <DiscoverRecipesResults filters={filters} />
          )}
        </>
      )}
      
      {!hasSearched && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto space-y-4">
            <div className="text-6xl">🍳</div>
            <h3 className="text-xl font-semibold text-navy">Ready to discover amazing recipes?</h3>
            <p className="text-muted-foreground">
              Use the filters above to find the perfect recipe for your meal. 
              Choose your preferences and let's start cooking!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}