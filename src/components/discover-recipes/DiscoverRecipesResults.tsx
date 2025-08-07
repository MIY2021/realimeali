import { DiscoverRecipeFilters } from "@/types/edamam";
import { useEdamamApi } from "@/hooks/useEdamamApi";
import { ExternalRecipeCard } from "./ExternalRecipeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DiscoverRecipesResultsProps {
  filters: DiscoverRecipeFilters;
}

export function DiscoverRecipesResults({ filters }: DiscoverRecipesResultsProps) {
  const { data: recipes, isLoading, error } = useEdamamApi(filters);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-navy">Discovering recipes...</h2>
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
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error.message || "Something went wrong while fetching recipes. Please try again."}
        </AlertDescription>
      </Alert>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto space-y-4">
          <div className="text-6xl">🔍</div>
          <h3 className="text-xl font-semibold text-navy">No recipes found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search terms. 
            Maybe try a broader search or different cuisine type?
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-navy">
          Found {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
        </h2>
        <div className="text-sm text-muted-foreground">
          External recipes from around the web
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {recipes.map((hit, index) => (
          <ExternalRecipeCard 
            key={`${hit.recipe.uri}-${index}`} 
            recipe={hit.recipe} 
          />
        ))}
      </div>
    </div>
  );
}