import { useState, useEffect } from "react";
import { DiscoverRecipesResults } from "./DiscoverRecipesResults";
import { CommunityRecipeSelectionView } from "@/components/community/CommunityRecipeSelectionView";
import { useCommunityRecipes } from "@/hooks/useCommunityRecipes";
import { DiscoverRecipeFilters } from "@/types/edamam";

export function DiscoverRecipesContent() {
  const [apiFilters, setApiFilters] = useState<DiscoverRecipeFilters | null>(null);
  const [communityOnly, setCommunityOnly] = useState(true); // Default to ON
  
  const { recipes: communityRecipes, isLoading: communityLoading, fetchCommunityRecipes } = useCommunityRecipes();

  // Fetch community recipes by default when component mounts or when toggled on
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
      <CommunityRecipeSelectionView
        recipes={communityRecipes}
        isLoading={communityLoading}
        communityOnly={communityOnly}
        onCommunityToggle={handleCommunityToggle}
        onSearch={(f) => setApiFilters(f)}
      />

      {apiFilters && (
        <DiscoverRecipesResults filters={apiFilters} />
      )}
    </div>
  );
}