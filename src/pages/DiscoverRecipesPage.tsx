import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { DiscoverRecipesContent } from "@/components/discover-recipes/DiscoverRecipesContent";
import { useIsMobile } from "@/hooks/use-mobile";
import { Search } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useCommunityRecipes } from "@/hooks/useCommunityRecipes";
import { useEdamamCount } from "@/hooks/useEdamamCount";

export default function DiscoverRecipesPage() {
  useDocumentTitle("Discover Recipes | RealiMeali");
  const isMobile = useIsMobile();
  const { totalCount: communityTotal, fetchCommunityRecipes } = useCommunityRecipes();
  const { count: apiTotal } = useEdamamCount();

  useEffect(() => {
    // fetch count only
    fetchCommunityRecipes({ limit: 1 });
  }, [fetchCommunityRecipes]);

  const combinedTotal = useMemo(() => {
    const total = (communityTotal || 0) + (apiTotal || 0);
    return total || undefined;
  }, [communityTotal, apiTotal]);

  return (
    <div className={`container max-w-7xl py-4 px-4 sm:py-8 sm:px-6 ${isMobile ? 'bg-white min-h-screen' : ''}`} data-scroll-content>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy flex items-center gap-2">
              <Search className="h-6 w-6 sm:h-8 sm:w-8 text-sage" />
              Discover Recipes
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {combinedTotal
                ? `Explore our carefully curated collection of over ${combinedTotal.toLocaleString()} recipes from around the world.`
                : "Explore amazing recipes from our community and beyond"}
            </p>
          </div>
        </div>
        <DiscoverRecipesContent />
      </div>
    </div>
  );
}