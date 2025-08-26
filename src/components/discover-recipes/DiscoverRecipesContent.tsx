import { useState } from "react";
import { DiscoverRecipeFilters } from "@/types/edamam";
import { useEdamamApiPagination } from "@/hooks/useEdamamApiPagination";
import { DiscoverRecipesFilters } from "./DiscoverRecipesFilters";
import { DiscoverRecipesResults } from "./DiscoverRecipesResults";

export function DiscoverRecipesContent() {
  const [apiFilters, setApiFilters] = useState<DiscoverRecipeFilters | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const { recipes: externalHits = [], isLoading: externalLoading, hasMore: externalHasMore, loadMore: loadMoreExternal, reset: resetExternal } = useEdamamApiPagination((apiFilters || {}) as DiscoverRecipeFilters);

  const handleSearch = (filters: DiscoverRecipeFilters) => {
    setApiFilters(filters);
    setHasSearched(true);
  };

  const handleClearSearch = () => {
    setApiFilters(null);
    setHasSearched(false);
    resetExternal();
  };

  return (
    <div className="space-y-6">
      <DiscoverRecipesFilters 
        onSearch={handleSearch}
        onReset={handleClearSearch}
      />
      
      <DiscoverRecipesResults
        hasSearched={hasSearched}
        externalHits={externalHits}
        externalLoading={externalLoading}
        externalHasMore={externalHasMore}
        onExternalLoadMore={loadMoreExternal}
      />
    </div>
  );
}