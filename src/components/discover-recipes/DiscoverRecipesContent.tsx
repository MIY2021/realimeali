import { useState, useEffect } from "react";
import { DiscoverRecipesResults } from "./DiscoverRecipesResults";
import { DiscoverRecipesFilters } from "./DiscoverRecipesFilters";
import { CommunityRecipeSelectionView } from "@/components/community/CommunityRecipeSelectionView";
import { useCommunityRecipes } from "@/hooks/useCommunityRecipes";
import { DiscoverRecipeFilters } from "@/types/edamam";

export function DiscoverRecipesContent() {
  const [filters, setFilters] = useState<DiscoverRecipeFilters>({});
  const [communityOnly, setCommunityOnly] = useState(true); // Default to ON
  
  const { recipes: communityRecipes, isLoading: communityLoading, fetchCommunityRecipes } = useCommunityRecipes();

  // Fetch community recipes by default when component mounts
  useEffect(() => {
    if (communityOnly) {
      fetchCommunityRecipes({ limit: 50 }); // Fetch more recipes for better discovery
    }
  }, [communityOnly]); // Removed fetchCommunityRecipes to prevent infinite re-renders

  const handleCommunityToggle = (enabled: boolean) => {
    setCommunityOnly(enabled);
    if (enabled) {
      // Fetch community recipes when toggled on
      fetchCommunityRecipes({ limit: 50 });
    }
  };

  return (
    <div className="space-y-6">
      {communityOnly ? (
        <CommunityRecipeSelectionView
          recipes={communityRecipes}
          isLoading={communityLoading}
          communityOnly={communityOnly}
          onCommunityToggle={handleCommunityToggle}
        />
      ) : (
        <>
          <DiscoverRecipesFilters
            onSearch={(f) => setFilters(f)}
            onReset={() => setFilters({})}
            communityOnly={communityOnly}
            onCommunityToggle={handleCommunityToggle}
          />
          <DiscoverRecipesResults filters={filters} />
        </>
      )}
    </div>
  );
}