import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EdamamHit } from "@/types/edamam";
import { ExternalRecipeCard } from "./ExternalRecipeCard";
import { Loader, Search } from "lucide-react";

interface DiscoverRecipesResultsProps {
  hasSearched: boolean;
  externalHits: EdamamHit[];
  externalLoading: boolean;
  externalHasMore: boolean;
  onExternalLoadMore: () => Promise<void>;
}

export function DiscoverRecipesResults({
  hasSearched,
  externalHits,
  externalLoading,
  externalHasMore,
  onExternalLoadMore
}: DiscoverRecipesResultsProps) {
  if (!hasSearched && externalHits.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <Search className="h-12 w-12 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-navy">
                Ready to discover amazing recipes?
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Use the filters above to search through over 2 million recipes from trusted sources around the web.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasSearched && externalHits.length === 0 && !externalLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <Search className="h-12 w-12 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-navy">
                No recipes found
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Try adjusting your search filters or using different keywords to find recipes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {hasSearched && externalHits.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-navy mb-4">
            Search Results ({externalHits.length} recipes found)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {externalHits.map((hit, index) => (
              <ExternalRecipeCard key={`${hit.recipe.uri}-${index}`} recipe={hit.recipe} />
            ))}
          </div>
        </div>
      )}

      {externalLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader className="h-8 w-8 animate-spin text-sage" />
          <span className="ml-2 text-muted-foreground">Loading more recipes...</span>
        </div>
      )}

      {hasSearched && externalHasMore && !externalLoading && (
        <div className="flex justify-center">
          <Button 
            onClick={onExternalLoadMore}
            variant="outline"
            size="lg"
          >
            Load More Recipes
          </Button>
        </div>
      )}
    </div>
  );
}