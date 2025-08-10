import { useState, useEffect } from "react";
import { CommunityRecipeSelectionView } from "@/components/community/CommunityRecipeSelectionView";
import { useCommunityRecipes } from "@/hooks/useCommunityRecipes";
import { DiscoverRecipeFilters } from "@/types/edamam";
import { useEdamamApiPagination } from "@/hooks/useEdamamApiPagination";

export function DiscoverRecipesContent() {
  const [apiFilters, setApiFilters] = useState<DiscoverRecipeFilters | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [communityOnly, setCommunityOnly] = useState(true); // Default to ON
  
  const { recipes: communityRecipes, isLoading: communityLoading, fetchCommunityRecipes, totalCount: communityTotal } = useCommunityRecipes();
  const { recipes: externalHits = [], isLoading: externalLoading, hasMore: externalHasMore, loadMore: loadMoreExternal, reset: resetExternal } = useEdamamApiPagination((apiFilters || {}) as DiscoverRecipeFilters);

  // Fetch community recipes by default when component mounts or when toggled on
  useEffect(() => {
    if (communityOnly) {
      fetchCommunityRecipes({ limit: 50 }); // Fetch more recipes for better discovery
    }
  }, [communityOnly, fetchCommunityRecipes]);


  const handleCommunityToggle = (enabled: boolean) => {
    setCommunityOnly(enabled);
    if (enabled) {
      // Fetch community recipes when toggled on
      fetchCommunityRecipes({ limit: 50 });
    }
  };

  return (
    <div className="space-y-6">
      <CommunityRecipeSelectionView
        recipes={communityRecipes}
        isLoading={communityLoading}
        communityOnly={communityOnly}
        onCommunityToggle={handleCommunityToggle}
        onSearch={(f) => { setApiFilters(f); setHasSearched(true); }}
        onClearSearch={() => { setApiFilters(null); setHasSearched(false); resetExternal(); }}
        hasSearched={hasSearched}
        externalHits={hasSearched ? externalHits : []}
        externalLoading={externalLoading}
        externalHasMore={hasSearched ? externalHasMore : false}
        onExternalLoadMore={loadMoreExternal}
      />

    </div>
  );
}