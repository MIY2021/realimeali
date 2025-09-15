import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useEdamamApi } from "@/hooks/useEdamamApi";
import { ExternalRecipeCard } from "@/components/discover-recipes/ExternalRecipeCard";
import { Skeleton } from "@/components/ui/skeleton";

export const LatestRecipesInspiration = () => {
  // Fetch trending recipes with simple filters
  const { data: hits, isLoading, error } = useEdamamApi({
    keyword: "healthy dinner",
    mealType: undefined,
    cuisineType: undefined,
    diet: undefined,
    time: undefined
  });

  const recipes = hits?.slice(0, 3).map(hit => hit.recipe) || [];

  if (error) {
    return null; // Silently fail if we can't fetch inspiration recipes
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sage" />
            Latest Recipes - Be Inspired
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/discover-recipes">
              Discover More
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recipes.map((recipe, index) => (
              <ExternalRecipeCard
                key={`${recipe.uri}-${index}`}
                recipe={recipe}
                mobileLayout="1"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No inspiration recipes available at the moment.
            </p>
            <Button asChild>
              <Link to="/discover-recipes">
                Explore Discover Recipes
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};